const db = require('../models/db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS "HtmlSections" (
            "HtmlSectionID" INTEGER NOT NULL UNIQUE,
            "Html" TEXT,
            "BlogPostId" INTEGER NOT NULL,
            "DateCreated" DATETIME DEFAULT CURRENT_TIMESTAMP,
            "DateUpdated" DATETIME,
            "ViewIndex" INTEGER,
            "Anchor" TEXT NOT NULL,
            "Slug" TEXT,
            CONSTRAINT "FK_HtmlSections_BlogPosts_BlogPostId" FOREIGN KEY("BlogPostId") REFERENCES "BlogPosts"("BlogPostId") ON DELETE CASCADE,
            PRIMARY KEY("HtmlSectionID" AUTOINCREMENT)
        );
    `);
});

class HtmlSection {
    static add(html, blogPostId, viewIndex, anchor, slug) {
        const dateCreated = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO HtmlSections (Html, BlogPostId, DateCreated, ViewIndex, Anchor, Slug) VALUES (?, ?, ?, ?, ?, ?)`,
                [html, blogPostId, dateCreated, viewIndex, anchor, slug], function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                });
        });
    }

    static edit(htmlSectionId, html, viewIndex, anchor, slug) {
        const dateUpdated = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.run(`UPDATE HtmlSections SET Html = ?, ViewIndex = ?, Anchor = ?, Slug = ?, DateUpdated = ? WHERE HtmlSectionID = ?`,
                [html, viewIndex, anchor, slug, dateUpdated, htmlSectionId], function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                });
        });
    }

    static delete(htmlSectionId) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM HtmlSections WHERE HtmlSectionID = ?`, [htmlSectionId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    static get(htmlSectionId) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM HtmlSections WHERE HtmlSectionID = ?`, [htmlSectionId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    static getAll(page = 1, limit = 5, sortField = 'DateCreated', sortOrder = 'DESC', filters = {}) {
        const offset = (page - 1) * limit;
        let whereClause = '';
        let params = [];
        if (filters.anchor) {
            whereClause += ' AND Anchor LIKE ?';
            params.push(`%${filters.anchor}%`);
        }
        if (filters.blogPostId) {
            whereClause += ' AND BlogPostId = ?';
            params.push(filters.blogPostId);
        }
        const query = `SELECT * FROM HtmlSections WHERE 1=1${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
        return new Promise((resolve, reject) => {
            db.all(query, [...params, limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static getHtmlSectionsCount(filter = {}) {
        let query = 'SELECT COUNT(*) AS count FROM HtmlSections WHERE 1=1';
        const params = [];

        if (filter.name) {
            query += ' AND name LIKE ?';
            params.push(`%${filter.name}%`);
        }

        if (filter.blogPostId) {
            query += ' AND BlogPostId = ?';
            params.push(`${filter.blogPostId}`);
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

module.exports = HtmlSection;

