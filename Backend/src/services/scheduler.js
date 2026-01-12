import cron from 'node-cron';
import competitionsSchema from '../models/competitions.schema.js';
import { sendEmail } from './emailService.js';

/**
 * Schedule reminder emails:
 * - 3 days before deadline
 * - 24 hours before deadline
 * 
 * Runs every day at 10:00 AM
 */
export const initScheduler = () => {
    // 0 10 * * * - Every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('Running competition reminder cron job...');

        try {
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
            const oneDayFromNow = new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000));

            // Find competitions with upcoming deadlines
            const competitions = await competitionsSchema.find({
                status: 'active',
                date: {
                    $gte: now.toISOString().split('T')[0],
                    $lte: threeDaysFromNow.toISOString().split('T')[0]
                }
            }).populate('applicants', 'fullname email');

            for (const comp of competitions) {
                const compDate = new Date(comp.date);
                const diffTime = Math.abs(compDate - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Determine reminder type
                let hoursRemaining = diffDays * 24;
                if (diffDays <= 1) hoursRemaining = 24;
                else if (diffDays <= 3) hoursRemaining = 72;
                else continue;

                for (const user of comp.applicants) {
                    await sendDeadlineReminderEmail(user, comp, hoursRemaining);
                }
            }
        } catch (error) {
            console.error('Reminder cron job failed:', error);
        }
    });
};

const sendDeadlineReminderEmail = async (user, competition, hoursRemaining) => {
    return sendEmail({
        to: user.email,
        subject: `Reminder: ${competition.title} is starting in ${hoursRemaining} hours!`,
        templateName: 'deadline-reminder',
        data: {
            userName: user.fullname,
            competitionTitle: competition.title,
            hoursRemaining,
            competitionDate: new Date(competition.date).toLocaleDateString(),
            platformUrl: `${process.env.CORS_ORIGIN}/employee/competitions/${competition._id}`
        }
    });
};
