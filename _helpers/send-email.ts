import nodemailer from 'nodemailer';
import config from '../config.json';

// Safely fall back to config.json only when not in production environment
const fileConfig = process.env.NODE_ENV === 'production' ? {} : config;

export default async function sendEmail({ to, subject, html, from }: any) {
    // Check if we are in production and have a Resend HTTP API key
    const hasResend = !!process.env.RESEND_API_KEY;

    if (hasResend) {
        return await sendWithResend({ to, subject, html, from });
    }

    // Fallback to local Ethereal SMTP if no Resend key is found
    const transporter = nodemailer.createTransport(getSmtpOptions());
    await transporter.sendMail({ from: from || getEmailFrom(), to, subject, html });
}

function getSmtpOptions(): any {
    if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
        throw 'SMTP_HOST environment variable is required in production to send emails';
    }

    // If environment variables exist, use them
    if (process.env.SMTP_HOST) {
        return {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            } : undefined
        };
    }

    // Otherwise, strictly fall back to local config
    if (!(fileConfig as any).smtpOptions) throw 'SMTP configuration is missing';
    return (fileConfig as any).smtpOptions;
}

function getEmailFrom() {
    return process.env.EMAIL_FROM || (fileConfig as any).emailFrom;
}

// HTTP implementation for Resend to avoid blocked cloud SMTP ports
async function sendWithResend({ to, subject, html, from }: any) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: from || getEmailFrom(),
            to,
            subject,
            html
        })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Resend API Error: ${JSON.stringify(error)}`);
    }
}