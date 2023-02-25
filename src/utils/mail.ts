import { createTransport } from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import { isEmail } from './validator';

let mailInstance;

const createMailInstance = () =>
  createTransport(
    smtpTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    }),
  );

export const sendEmail = (to: string, subject: string, html: string) =>
  new Promise((resolve, reject) => {
    if (!isEmail(to)) throw new Error(`is Not email`);
    if (!mailInstance) mailInstance = createMailInstance();
    mailInstance.sendMail(
      {
        to,
        subject,
        html,
        from: process.env.EMAIL_FROM,
      },
      (err) => {
        if (err) {
          reject(err);
        } else resolve(true);
      },
    );
  });
