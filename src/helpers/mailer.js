import nodemailer from "nodemailer";

// Create and export a reusable mail transporter
export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,   // brandon_jamil_so@dlsu.edu.ph
    pass: process.env.MAIL_PASS    // app password from Gmail
  }
});