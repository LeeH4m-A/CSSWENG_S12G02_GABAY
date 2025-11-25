import dotenv from 'dotenv';
dotenv.config(); // make sure env is loaded first

import nodemailer from "nodemailer";

// Create and export a reusable mail transporter
export const transporter = (() => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  console.log('MAIL_USER:', user);
  console.log('MAIL_PASS:', pass ? 'Loaded' : 'Missing');

  const t = nodemailer.createTransport({
    service: "Gmail",
    auth: { user, pass }
  });

  t.verify((err, success) => {
    if (err) console.error('Transporter verify failed:', err);
    else console.log('Transporter ready to send emails');
  });

  return t;
})();
