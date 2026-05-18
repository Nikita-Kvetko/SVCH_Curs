import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
};

export const formatCurrency = (value) => {
  if (!value) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: 'RUB', 
    minimumFractionDigits: 0 
  }).format(value);
};

// Экспорт в Excel
export const exportToExcel = (data, title, columns, filename) => {
  const worksheetData = [
    [title],
    [`Дата генерации: ${new Date().toLocaleString('ru-RU')}`],
    [`Всего записей: ${data.length}`],
    [],
    columns.map(col => col.label),
    ...data.map(row => columns.map(col => {
      const value = col.accessor(row);
      return value !== undefined && value !== null ? value : '—';
    })),
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  worksheet['!cols'] = columns.map(() => ({ wch: 20 }));
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// Экспорт в PDF с конвертацией текста в изображение (работает с русским)
export const exportToPDF = async (data, title, columns, filename) => {
  // Создаем временный контейнер для рендеринга
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1100px';
  container.style.backgroundColor = 'white';
  container.style.padding = '30px';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Формируем HTML таблицу
  let tableRows = '';
  for (const row of data) {
    tableRows += '<tr>';
    for (const col of columns) {
      const value = col.accessor(row);
      tableRows += `<td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${value !== undefined && value !== null ? value : '—'}</td>`;
    }
    tableRows += '</tr>';
  }
  
  let headerRows = '';
  for (const col of columns) {
    headerRows += `<th style="border: 1px solid #ddd; padding: 10px; background-color: #2e7d32; color: white; font-weight: bold;">${col.label}</th>`;
  }
  
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2e7d32; margin-bottom: 10px;">${title}</h1>
      <div style="color: #666; font-size: 12px;">
        <div><strong>Дата генерации:</strong> ${new Date().toLocaleString('ru-RU')}</div>
        <div><strong>Всего записей:</strong> ${data.length}</div>
      </div>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>${headerRows}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #999;">
      Agri Coworking - Система управления фермами<br>
      Документ сгенерирован автоматически
    </div>
  `;
  
  document.body.appendChild(container);
  
  try {
    // Используем html2canvas для конвертации HTML в изображение
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    // Если html2canvas не установлен, показываем сообщение
    alert('Для экспорта в PDF необходимо установить html2canvas. Выполните команду:\nnpm install html2canvas\n\nИли используйте экспорт в Excel');
    return false;
  } finally {
    document.body.removeChild(container);
  }
};