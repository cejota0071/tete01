const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const database = require('./database');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session(config.session));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await database.authenticateUser(username, password);
        if (user) {
            req.session.user = user;
            res.redirect('/admin');
        } else {
            res.send(`
                <script>
                    alert('Credenciais inválidas!');
                    window.location.href = '/login';
                </script>
            `);
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API endpoint to check authentication status
app.get('/api/auth-status', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// API endpoint to get Firebase config (server-side only)
app.get('/api/firebase-config', (req, res) => {
    // Only return config if user is authenticated
    if (req.session.user) {
        res.json(config.firebase);
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Initialize database with config path
database.init(config.database.path);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${config.server.env} mode)`);
    console.log('Database initialized at:', config.database.path);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    database.close();
    process.exit(0);
});
