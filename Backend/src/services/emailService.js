import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media only screen and (max-width: 600px) {
                    .email-container { width: 100% !important; }
                    .content-padding { padding: 20px !important; }
                    .header-padding { padding: 30px 20px !important; }
                    h1 { font-size: 24px !important; }
                    .cta-button { padding: 12px 25px !important; font-size: 14px !important; }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 10px;">
                <tr>
                    <td align="center">
                        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td class="header-padding" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🎉 Registration Confirmed!</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td class="content-padding" style="padding: 40px 30px;">
                                    <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">Hi <strong>${user.fullname}</strong>,</p>
                                    
                                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 25px;">
                                        Congratulations! You have successfully registered for <strong style="color: #667eea;">${competition.title}</strong>. 
                                        We're excited to have you participate in this competition!
                                    </p>
                                    
                                    <!-- Competition Details Card -->
                                    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
                                        <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">📋 Competition Details</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>📅 Date:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${new Date(competition.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>🏆 Prize:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${competition.prize || 'To Be Announced'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>👤 Organizer:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${competition.organizer?.fullname || 'JobPortal Team'}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Tips Section -->
                                    <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                        <h4 style="color: #c53030; margin: 0 0 10px; font-size: 16px;">💡 Pro Tips for Success</h4>
                                        <ul style="color: #742a2a; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                                            <li>Mark your calendar and set a reminder</li>
                                            <li>Review the competition guidelines carefully</li>
                                            <li>Prepare your materials in advance</li>
                                            <li>Join early to avoid last-minute technical issues</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- CTA Button -->
                                    <div style="text-align: center; margin: 35px 0;">
                                        <a href="http://localhost:3000/competitions/${competition._id}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">View Competition Details</a>
                                    </div>
                                    
                                    <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 25px 0 0;">
                                        Good luck! We can't wait to see your amazing performance. If you have any questions, feel free to reach out to us.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f7fafc; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="color: #718096; font-size: 14px; margin: 0 0 10px;">Best regards,<br><strong>JobPortal Team</strong></p>
                                    <div style="margin: 20px 0;">
                                        <a href="http://localhost:3000/competitions" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Browse Competitions</a> |
                                        <a href="http://localhost:3000/jobs" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">Find Jobs</a> |
                                        <a href="http://localhost:3000/profile" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 13px;">My Profile</a>
                                    </div>
                                    <p style="color: #a0aec0; font-size: 12px; margin: 15px 0 0;">This is an automated email from JobPortal. Please do not reply to this email.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    return sendEmail({
        to: user.email,
        subject: `🎉 Registration Confirmed: ${competition.title}`,
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

/**
 * Job Application Confirmation Email
 */
export const sendJobApplicationEmail = async (user, job) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media only screen and (max-width: 600px) {
                    .email-container { width: 100% !important; }
                    .content-padding { padding: 20px !important; }
                    .header-padding { padding: 30px 20px !important; }
                    h1 { font-size: 24px !important; }
                    .cta-button { display: block !important; margin: 10px 0 !important; padding: 12px 25px !important; font-size: 14px !important; }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 10px;">
                <tr>
                    <td align="center">
                        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td class="header-padding" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✅ Application Submitted!</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td class="content-padding" style="padding: 40px 30px;">
                                    <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">Hi <strong>${user.fullname}</strong>,</p>
                                    
                                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 25px;">
                                        Great news! Your application for <strong style="color: #11998e;">${job.title}</strong> at 
                                        <strong style="color: #11998e;">${job.company}</strong> has been successfully submitted.
                                    </p>
                                    
                                    <!-- Success Message -->
                                    <div style="background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; border-left: 4px solid #11998e;">
                                        <p style="color: #00695c; font-size: 18px; margin: 0; font-weight: bold;">🎯 Your application is now under review!</p>
                                    </div>
                                    
                                    <!-- Job Details Card -->
                                    <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #e9ecef;">
                                        <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">💼 Job Details</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px; width: 40%;"><strong>🏢 Company:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${job.company}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>📍 Location:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${job.location}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>💼 Job Type:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${job.jobType || 'Not specified'}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>💰 Salary:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${job.salary || 'Not specified'}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- What's Next Section -->
                                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                        <h4 style="color: #856404; margin: 0 0 10px; font-size: 16px;">📌 What Happens Next?</h4>
                                        <ol style="color: #856404; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                                            <li>The recruiter will review your application</li>
                                            <li>You'll receive an email when your application status changes</li>
                                            <li>Track your application status in your dashboard</li>
                                            <li>Keep your profile updated for better chances</li>
                                        </ol>
                                    </div>
                                    
                                    <!-- CTA Buttons -->
                                    <div style="text-align: center; margin: 35px 0;">
                                        <a href="http://localhost:3000/applications" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 5px; box-shadow: 0 4px 6px rgba(17, 153, 142, 0.3);">Track Application</a>
                                        <a href="http://localhost:3000/jobs" class="cta-button" style="display: inline-block; background-color: #ffffff; color: #11998e; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 5px; border: 2px solid #11998e;">Browse More Jobs</a>
                                    </div>
                                    
                                    <!-- Tips Section -->
                                    <div style="background-color: #f0f4ff; border-left: 4px solid #4c6ef5; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                        <h4 style="color: #364fc7; margin: 0 0 10px; font-size: 16px;">💡 Tips While You Wait</h4>
                                        <ul style="color: #364fc7; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                                            <li>Keep your phone and email accessible</li>
                                            <li>Research more about the company</li>
                                            <li>Prepare for potential interviews</li>
                                            <li>Continue applying to other opportunities</li>
                                        </ul>
                                    </div>
                                    
                                    <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 25px 0 0;">
                                        We'll notify you as soon as there's an update on your application. Best of luck! 🍀
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f7fafc; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="color: #718096; font-size: 14px; margin: 0 0 10px;">Best regards,<br><strong>JobPortal Team</strong></p>
                                    <div style="margin: 20px 0;">
                                        <a href="http://localhost:3000/applications" style="color: #11998e; text-decoration: none; margin: 0 10px; font-size: 13px;">My Applications</a> |
                                        <a href="http://localhost:3000/jobs" style="color: #11998e; text-decoration: none; margin: 0 10px; font-size: 13px;">Find Jobs</a> |
                                        <a href="http://localhost:3000/profile" style="color: #11998e; text-decoration: none; margin: 0 10px; font-size: 13px;">Update Profile</a>
                                    </div>
                                    <p style="color: #a0aec0; font-size: 12px; margin: 15px 0 0;">This is an automated email from JobPortal. Please do not reply to this email.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    return sendEmail({
        to: user.email,
        subject: `✅ Application Submitted: ${job.title} at ${job.company}`,
        html,
        text: `Your application for ${job.title} at ${job.company} has been submitted successfully.`
    });
};

/**
 * Competition Closed Notification Email
 */
export const sendCompetitionClosedEmail = async (user, competition) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media only screen and (max-width: 600px) {
                    .email-container { width: 100% !important; }
                    .content-padding { padding: 20px !important; }
                    .header-padding { padding: 30px 20px !important; }
                    h1 { font-size: 24px !important; }
                    .cta-button { display: block !important; margin: 10px 0 !important; padding: 12px 25px !important; font-size: 14px !important; }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 10px;">
                <tr>
                    <td align="center">
                        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td class="header-padding" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🏁 Competition Closed</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td class="content-padding" style="padding: 40px 30px;">
                                    <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">Hi <strong>${user.fullname}</strong>,</p>
                                    
                                    <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 25px;">
                                        The competition <strong style="color: #f5576c;">${competition.title}</strong> has officially closed. 
                                        Thank you for your participation and dedication!
                                    </p>
                                    
                                    <!-- Competition Summary Card -->
                                    <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #f5576c;">
                                        <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">📊 Competition Summary</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>🏆 Competition:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${competition.title}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>📅 Date:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${new Date(competition.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #4a5568; font-size: 15px;"><strong>💎 Prize:</strong></td>
                                                <td style="color: #2d3748; font-size: 15px;">${competition.prize || 'To Be Announced'}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Thank You Message -->
                                    <div style="background-color: #e6fffa; border-left: 4px solid #38b2ac; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                                        <h3 style="color: #234e52; margin: 0 0 10px; font-size: 20px;">🙏 Thank You for Participating!</h3>
                                        <p style="color: #2c7a7b; margin: 10px 0; line-height: 1.6;">
                                            Your effort and enthusiasm made this competition a success. We appreciate your time and dedication.
                                        </p>
                                    </div>
                                    
                                    <!-- What's Next Section -->
                                    <div style="background-color: #fef5e7; border-left: 4px solid #f39c12; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                        <h4 style="color: #7d6608; margin: 0 0 10px; font-size: 16px;">🎯 What's Next?</h4>
                                        <ul style="color: #7d6608; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                                            <li><strong>Results:</strong> Will be announced within the next few days</li>
                                            <li><strong>Notification:</strong> Winners will be contacted via email</li>
                                            <li><strong>Updates:</strong> Check your dashboard for announcements</li>
                                            <li><strong>Feedback:</strong> We may reach out for your valuable feedback</li>
                                        </ul>
                                    </div>
                                    
                                    <!-- CTA Buttons -->
                                    <div style="text-align: center; margin: 35px 0;">
                                        <a href="http://localhost:3000/competitions/${competition._id}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 5px; box-shadow: 0 4px 6px rgba(245, 87, 108, 0.3);">View Competition</a>
                                        <a href="http://localhost:3000/jobs" class="cta-button" style="display: inline-block; background-color: #ffffff; color: #f5576c; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 5px; border: 2px solid #f5576c;">Explore Job Opportunities</a>
                                    </div>
                                    
                                    <!-- Stay Connected -->
                                    <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                                        <h4 style="color: #075985; margin: 0 0 10px; font-size: 16px;">🌟 Stay Connected!</h4>
                                        <p style="color: #0c4a6e; margin: 10px 0; line-height: 1.6;">
                                            Don't miss out on upcoming competitions and exclusive job opportunities. 
                                            Keep your profile updated and stay active on our platform!
                                        </p>
                                    </div>
                                    
                                    <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 25px 0 0;">
                                        Once again, thank you for being part of this competition. We look forward to seeing you in future events! 🎊
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f7fafc; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="color: #718096; font-size: 14px; margin: 0 0 10px;">Best regards,<br><strong>JobPortal Team</strong></p>
                                    <div style="margin: 20px 0;">
                                        <a href="http://localhost:3000/competitions" style="color: #f5576c; text-decoration: none; margin: 0 10px; font-size: 13px;">Competitions</a> |
                                        <a href="http://localhost:3000/jobs" style="color: #f5576c; text-decoration: none; margin: 0 10px; font-size: 13px;">Jobs</a> |
                                        <a href="http://localhost:3000/profile" style="color: #f5576c; text-decoration: none; margin: 0 10px; font-size: 13px;">Profile</a>
                                    </div>
                                    <p style="color: #a0aec0; font-size: 12px; margin: 15px 0 0;">This is an automated email from JobPortal. Please do not reply to this email.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    return sendEmail({
        to: user.email,
        subject: `🏁 Competition Closed: ${competition.title} - Results Coming Soon!`,
        html,
        text: `The competition ${competition.title} has been closed. Thank you for participating! Results will be announced soon.`
    });
};
