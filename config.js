require('dotenv').config();

module.exports = {
    session: {
        secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    },
    database: {
        path: process.env.DB_PATH || './admin.db'
    },
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    admin: {
        defaultUsername: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'Ju#l1orr@20@'
    }
};
