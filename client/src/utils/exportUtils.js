import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToPDF = (data, title, columns, filename) => {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Дата генерации: ${new Date().toLocaleString('ru-RU')}`, 14, 25);
  
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: data.map(row => columns.map(col => col.accessor(row))),
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [46, 125, 50] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });
  
  doc.save(`${filename}_${new Date().toISOString().slice(0, 19)}.pdf`);
};

export const exportToExcel = (data, title, columns, filename) => {
  const worksheetData = [
    [title],
    [`Дата генерации: ${new Date().toLocaleString('ru-RU')}`],
    [],
    columns.map(col => col.label),
    ...data.map(row => columns.map(col => col.accessor(row))),
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  worksheet['!cols'] = columns.map(() => ({ wch: 20 }));
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().slice(0, 19)}.xlsx`);
};

export const formatCurrency = (value) => {
  if (!value) return '0 ₽';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU');
};