import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send email with HTML content
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'JobPortal'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || subject
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error.message);
        throw error;
    }
};

/**
 * Competition Registration Email
 */
export const sendCompetitionRegistrationEmail = async (user, competition) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Registration Confirmed!</h2>
            <p>Hi ${user.fullname},</p>
            <p>You have successfully registered for <strong>${competition.title}</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Competition Details:</strong></p>
                <p>📅 Date: ${new Date(competition.date).toLocaleDateString()}</p>
                <p>🏆 Prize: ${competition.prize || 'TBA'}</p>
            </div>
            <p>Good luck!</p>
            <p style="color: #6b7280; font-size: 12px;">This is an automated email from JobPortal.</p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `Registration Confirmed: ${competition.title}`,
        html,
        text: `You have successfully registered for ${competition.title}. Date: ${new Date(competition.date).toLocaleDateString()}`
    });
};

/**
 * Application Status Update Email
 */
export const sendStatusUpdateEmail = async (user, job, status) => {
    const statusMessages = {
        'Viewed': 'Your application has been viewed by the recruiter.',
        'Shortlisted': 'Congratulations! You have been shortlisted.',
        'Rejected': 'Thank you for your interest. We will not be moving forward at this time.',
        'Hired': 'Congratulations! You have been selected for the position!'
    };

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Application Status Update</h2>
            <p>Hi ${user.fullname},</p>
            <p>Your application for <strong>${job.title}</strong> has been updated.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Status:</strong> ${status}</p>
                <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
            </div>
            <p>Best regards,<br>JobPortal Team</p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `Application Update: ${job.title}`,
        html,
        text: `Your application for ${job.title} status: ${status}`
    });
};
