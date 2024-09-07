const db = require('../models/db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS "BlogPosts" (
	        "BlogPostId"	INTEGER NOT NULL,
	        "Title"	TEXT NOT NULL,
	        "Content"	TEXT NOT NULL,
	        "CreatedAt"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	        "UpdatedAt"	DATETIME,
	        "BlogId"	INTEGER NOT NULL,
	        "Slug"	TEXT,
	        "UserId"	TEXT,
	        "Author"	TEXT,
	        "MetaKeywords"	TEXT,
	        "MetaDescription"	TEXT,
	        "Footer"	TEXT,
	        "BeforeEndOfBodyScript"	TEXT,
	        PRIMARY KEY("BlogPostId" AUTOINCREMENT),
	        FOREIGN KEY("UserId") REFERENCES "users"("id") ON UPDATE CASCADE,
	        FOREIGN KEY("BlogId") REFERENCES "Blogs"("BlogId") ON DELETE CASCADE
        );
    `);
});

class BlogPost {
    static add(title, slug, blogId, author, userId, content) {
        
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO BlogPosts (Title, Content, BlogId, Author, UserId, Slug) VALUES (?, ?, ?, ?, ?, ?)`,
                [title, content, blogId, author, userId, slug], function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
        });
    }

    static edit(blogPostId, title, slug, blogId, author, userId, content, metaDescription, metaKeywords, footer) {
        const updatedAt = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.run(`UPDATE BlogPosts SET Title = ?, Slug = ?, UpdatedAt = ?, BlogId = ?, Author = ?, UserId = ?, Content = ?, MetaDescription = ?, MetaKeywords = ?, Footer = ? WHERE BlogPostId = ?`,
                [title, slug, updatedAt, blogId, author, userId, content, metaDescription, metaKeywords, footer, blogPostId], function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                });
        });
    }

    static delete(blogPostId) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM BlogPosts WHERE BlogPostId = ?`, [blogPostId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    static get(blogPostId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM BlogPosts WHERE BlogPostId = ?`, [blogPostId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    static getBlogPostBySlug(slug) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM BlogPosts WHERE Slug = ?`, [slug], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    static getAll(page = 1, limit = 10, sortField = 'CreatedAt', sortOrder = 'DESC', filters = {}) {
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
        if (filters.blogId) {
            whereClause += ' AND BlogId = ?';
            params.push(filters.blogId);
        }
        const query = `SELECT * FROM BlogPosts WHERE 1=1${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
        return new Promise((resolve, reject) => {
            db.all(query, [...params, limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static getBlogPostsCount(filter = {}) {
        let query = 'SELECT COUNT(*) AS count FROM BlogPosts WHERE 1=1';
        const params = [];

        if (filter.title) {
            query += ' AND Title LIKE ?';
            params.push(`%${filter.title}%`);
        }

        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) return reject(err);
                resolve(row.count);
            });
        });
    }
}

module.exports = BlogPost;
