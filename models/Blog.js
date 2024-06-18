const db = require('../models/db');
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS "Blogs" (
	        "BlogId"	INTEGER NOT NULL,
	        "Title"	TEXT NOT NULL,
	        "Description"	TEXT,
	        "DateCreated"	TEXT,
	        "Author"	TEXT,
	        CONSTRAINT "PK_Blogs" PRIMARY KEY("BlogId" AUTOINCREMENT)
        );
    `);
});

class Blog {
    static add(title, description, author) {
        const dateCreated = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO Blogs (Title, Description, DateCreated, Author) VALUES (?, ?, ?, ?)`,
                [title, description, dateCreated, author], function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
        });
    }

    static edit(blogId, title, description) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE Blogs SET Title = ?, Description = ? WHERE BlogId = ?`,
                [title, description, blogId], function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                });
        });
    }

    static delete(blogId) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM Blogs WHERE BlogId = ?`, [blogId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    static get(blogId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM Blogs WHERE BlogId = ?`, [blogId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    static getAll(page = 1, limit = 1, sortField = 'DateCreated', sortOrder = 'DESC', filters = {}) {
        const offset = (page - 1) * limit;
        let whereClause = '';
        let params = [];
        if (filters.title) {
            whereClause += ' AND Title LIKE ?';
            params.push(`%${filters.title}%`);
        }
        if (filters.author) {
            whereClause += ' AND Author LIKE ?';
            params.push(`%${filters.author}%`);
        }
        const query = `SELECT * FROM Blogs WHERE 1=1${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
        return new Promise((resolve, reject) => {
            db.all(query, [...params, limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static getBlogsCount(filter = {}) {
        let query = 'SELECT COUNT(*) AS count FROM Blogs WHERE 1=1';
        const params = [];

        if (filter.name) {
            query += ' AND name LIKE ?';
            params.push(`%${filter.name}%`);
        }

        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) {
                    this.logError(err);
                    return reject(err);
                }
                resolve(row.count);
            });
        });
    }
}

module.exports = Blog;
