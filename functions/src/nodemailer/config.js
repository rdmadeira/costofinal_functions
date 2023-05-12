import nodemailer from 'nodemailer';
import path from 'path';
import dotenv from 'dotenv';

const dotenvPath = path.join(process.cwd(), '.env');
dotenv.config({ path: dotenvPath });

console.log('congig.js:8 -', process.cwd());
console.log('congig.js:9 -', process.env.P);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.P,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transporter;
