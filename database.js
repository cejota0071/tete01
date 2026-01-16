const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

class Database {
    constructor() {
        this.db = new sqlite3.Database('./admin.db', (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database.');
                this.init();
            }
        });
    }

    async init() {
        try {
            // Create users table
            await this.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Check if default admin user exists
            const existingAdmin = await this.get('SELECT * FROM users WHERE username = ?', ['admin']);

            if (!existingAdmin) {
                // Create default admin user
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await this.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', hashedPassword]);
                console.log('Default admin user created:');
                console.log('Username: admin');
                console.log('Password: admin123');
            }
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async authenticateUser(username, password) {
        try {
            const user = await this.get('SELECT * FROM users WHERE username = ?', [username]);

            if (user && await bcrypt.compare(password, user.password_hash)) {
                // Return user without password hash
                const { password_hash, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }

            return null;
        } catch (error) {
            console.error('Authentication error:', error);
            return null;
        }
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

module.exports = new Database();
