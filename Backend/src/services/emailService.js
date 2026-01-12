import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Load and render HTML template
 */
const renderTemplate = (templateName, data) => {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders like {{name}} with real data
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
    });

    return template;
};

/**
 * Interface for sending emails
 */
export const sendEmail = async ({ to, subject, templateName, data, textFallback }) => {
    try {
        const html = renderTemplate(templateName, data);

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Platform Name'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: textFallback || subject
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

/**
 * Specific email workflows
 */

// 1. Competition Registration Confirmation
export const sendCompetitionRegistrationEmail = async (user, competition) => {
    return sendEmail({
        to: user.email,
        subject: `Registration Confirmed: ${competition.title}`,
        templateName: 'competition-registration',
        data: {
            userName: user.fullname,
            competitionTitle: competition.title,
            competitionDate: new Date(competition.date).toLocaleDateString(),
            competitionPrize: competition.prize || 'TBA',
            organizerName: competition.organizer?.fullname || 'Organizer',
            platformUrl: `${process.env.CORS_ORIGIN}/employee/competitions/${competition._id}`
        }
    });
};

// 2. Application Status Update
export const sendStatusUpdateEmail = async (user, competition, status) => {
    let statusText = status.charAt(0).toUpperCase() + status.slice(1);

    return sendEmail({
        to: user.email,
        subject: `Update on your application: ${competition.title}`,
        templateName: 'status-update',
        data: {
            userName: user.fullname,
            competitionTitle: competition.title,
            status: statusText,
            statusClass: status.toLowerCase(),
            message: getStatusMessage(status),
            platformUrl: `${process.env.CORS_ORIGIN}/employee/competitions/${competition._id}`
        }
    });
};

const getStatusMessage = (status) => {
    switch (status.toLowerCase()) {
        case 'shortlisted': return 'Congratulations! You have been shortlisted for the next round.';
        case 'accepted': return 'Great news! Your application has been accepted.';
        case 'rejected': return 'Thank you for your interest. Unfortunately, we will not be moving forward with your application at this time.';
        default: return `Your application status has been updated to: ${status}`;
    }
};
