import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = [
    'PORT',
    'MONGODB_URI',
    'CORS_ORIGIN',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM_EMAIL'
];

export const validateEnv = () => {
    const missing = requiredEnv.filter(env => !process.env[env]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};
