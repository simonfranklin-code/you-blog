const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Create User table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS "Users" (
	        "id"	INTEGER,
	        "username"	VARCHAR(255) NOT NULL UNIQUE,
	        "email"	VARCHAR(255) NOT NULL UNIQUE,
	        "password"	VARCHAR(255) NOT NULL,
	        "dateCreated" TEXT,
	        "dateModified"	TEXT,
	        PRIMARY KEY("id" AUTOINCREMENT)
        );
    `);
});

class User {



    static async create(username, email, password, role = 'user') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return new Promise((resolve, reject) => {

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                db.run('INSERT INTO Users (username, email, password, dateCreated, dateModified, role) VALUES (?, ?, ?, ?, ?, ?)', [username, email, hashedPassword, new Date(), new Date(), role], (err) => {

                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    db.get('SELECT last_insert_rowid() as id', (err, insertedRow) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        let findUserByIdSql = 'SELECT * FROM Users WHERE Id = ' + insertedRow.id;
                        db.get(findUserByIdSql, [], (err, row) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }
                            db.run('COMMIT');
                            resolve({ id: insertedRow.Id, username: username, email: email, password: hashedPassword, dateCreated: row.dateCreated, dateModified: row.dateModified });
                        });
                    });

                });

            });
        });
    }

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static updatePassword(email, password) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE email = ?',
                [password, email],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        });
    }

    static findAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    static update(id, { username, email, role }) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
                [username, email, role, id],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM users WHERE id = ?',
                [id],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        });
    }

    static updatePassword(email, password) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE email = ?',
                [password, email],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        });
    }



    static findAll({ page = 1, limit = 10, filters = {}, sort = {} } = {}) {
        const offset = (page - 1) * limit;
        const { username, email, role, keyword } = filters;
        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (username) {
            query += ' AND username LIKE ?';
            params.push(`%${username}%`);
        }

        if (email) {
            query += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (keyword) {
            query += ' AND (username LIKE ? OR email LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (sort.field) {
            query += ` ORDER BY ${sort.field} ${sort.order}`;
        } else {
            query += ' ORDER BY id ASC';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    return reject(new Error('Failed to retrieve users'));
                }
                resolve(rows);
            });
        });
    }

    static countAll({ filters = {} } = {}) {
        const { username, email, role, keyword } = filters;
        let query = 'SELECT COUNT(*) AS count FROM users WHERE 1=1';
        const params = [];

        if (username) {
            query += ' AND username LIKE ?';
            params.push(`%${username}%`);
        }

        if (email) {
            query += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (keyword) {
            query += ' AND (username LIKE ? OR email LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) {
                    return reject(new Error('Failed to count users'));
                }
                resolve(row.count);
            });
        });
    }
}
module.exports = User;

