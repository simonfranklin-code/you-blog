const db = require('../models/db');
const axios = require('axios');
const cheerio = require('cheerio');

db.serialize(() => {
    db.run(`

        CREATE TABLE IF NOT EXISTS "HtmlSections" (
	        "HtmlSectionID"	INTEGER NOT NULL UNIQUE,
	        "Html"	TEXT,
	        "BlogPostId"	INTEGER NOT NULL,
	        "DateCreated"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	        "DateUpdated"	DATETIME,
	        "ViewIndex"	INTEGER,
	        "Anchor"	TEXT NOT NULL,
	        "Slug"	TEXT,
	        "UserId"	INTEGER NOT NULL,
	        CONSTRAINT "FK_HtmlSections_users_id" FOREIGN KEY("UserId") REFERENCES "users"("id") ,
	        PRIMARY KEY("HtmlSectionID" AUTOINCREMENT),
	        CONSTRAINT "FK_HtmlSections_BlogPosts_BlogPostId" FOREIGN KEY("BlogPostId") REFERENCES "BlogPosts"("BlogPostId") ON DELETE CASCADE
        );
    `);
});

class HtmlSection {

    static add(html, blogPostId, viewIndex, anchor, slug) {
        const dateCreated = new Date().toISOString();
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO HtmlSections (Html, BlogPostId, ViewIndex, Anchor, Slug) VALUES (?, ?, ?, ?, ?)`,
                [html, blogPostId, viewIndex, anchor, slug], function (err) {
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

    static deleteBySlug(slug) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM HtmlSections WHERE Slug = ?`,
                [slug], function (err) {
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

    static async getAll(page = 1, limit = 5, sortField = 'ViewIndex', sortOrder = 'DESC', filters = {}) {
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

    static async getAllInternal(blogPostId) {

        const query = `SELECT * FROM HtmlSections WHERE BlogPostId = ? ORDER BY ViewIndex ASC`;
        return new Promise((resolve, reject) => {
            db.all(query, [blogPostId], (err, rows) => {
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

    // Fetch HTML content from the given URL
    static async fetchHTML(url) {
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (error) {
            console.error(`Error fetching the URL: ${url}`, error);
            throw error;
        }
    }

    // Extract a single HTML section based on its id attribute using cheerio
    static extractHtmlSectionById(html, id) {
        const $ = cheerio.load(html);
        const section = $(`section#${id}`);

        if (section.length > 0) {
            return [$.html(section), section.attr('id')];
        }

        return null;
    }

    // Extract HTML section using cheerio
    static extractHtmlSections(html) {
        const $ = cheerio.load(html);
        const sections = [];

        $('section').each((index, element) => {
            sections.push([$.html(element), $(element).attr('id')]);
        });

        return sections;
    }

    // Update HTML sections in the database
    static async insertHtmlSections(blogPostId, htmlSections, slug) {

        await HtmlSection.deleteBySlug(slug);

        if (htmlSections !== 'undefined' && htmlSections.length > 0) {

            for (let i = 0; i < htmlSections.length; i++) {

                const [htmlContent, anchor] = htmlSections[i]; // Destructure the outer HTML and id (anchor) from each sub-array
                
                await HtmlSection.add(htmlContent, blogPostId, i + 1, anchor, slug);
                
                try {
                    
                    console.log(`HtmlSection ${slug} inserted successfully.`);
                } catch (error) {
                    console.error(`Error updating HtmlSection ${i}`, error);
                }

            }

        }

    }

    // Main function to execute the steps
    static async importHtml(url, blogPostId, slug) {
        try {
            const html = await HtmlSection.fetchHTML(url);
            const htmlSections = await HtmlSection.extractHtmlSections(html);
            await HtmlSection.insertHtmlSections(blogPostId, htmlSections, slug);
            return new Promise((resolve, reject) => {
                if (htmlSections === 'undefined') {
                    reject(new Error('htmlSections is undefined'));
                } else if (htmlSections.length <= 0) {
                    reject(new Error('htmlSections is <= 0'));
                } else {

                    resolve(htmlSections);
                }
            });

        } catch (error) {
            console.error('Error in main function', error);
        }
    }

    // Main function to execute the steps
    static async importSingleHtmlSection(url, id) {
        try {
            const html = await HtmlSection.fetchHTML(url);
            const htmlSections = await HtmlSection.extractHtmlSectionById(html, id);
            //await HtmlSection.updateHtmlSections(blogPostId, htmlSections);
            return new Promise((resolve, reject) => {
                if (htmlSections === 'undefined') {
                    reject(new Error('htmlSections is undefined'));
                } else if (htmlSections.length <= 0) {
                    reject(new Error('htmlSections is <= 0'));
                } else {

                    resolve(htmlSections);
                }
            });

        } catch (error) {
            console.error('Error in main function', error);
        }
    }
}

module.exports = HtmlSection;

