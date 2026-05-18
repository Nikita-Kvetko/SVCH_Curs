const nodemailer = require('nodemailer');

// Настройка транспортера (для теста используем ethereal.email)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'your-test-email@ethereal.email', // Замените на свои данные
    pass: 'your-password'
  }
});

// Для реальной отправки используйте свой SMTP
// Например, для Gmail:
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'your-email@gmail.com',
//     pass: 'your-app-password'
//   }
// });

const sendReportEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    const info = await transporter.sendMail({
      from: '"Agri Coworking" <noreply@agricoworking.ru>',
      to,
      subject,
      html: htmlContent,
      attachments
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendReportEmail };