const { validationResult } = require('express-validator');

exports.addCommentReply = (req, res) => {

    console.log(req.body); // Access posted data here
    console.log('Request received');
    const sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('C:\\Users\\Susana Rijo\\Source\\repos\\Smf\\YouBlog\\Server\\Digital-Marketing-Guru.db', (err) => {
        if (err) {
            console.error(err.message);
            return;
        }


        // Validate user input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }




        const { Email, Author, DisplayName, Url, Text, DateCreated, DateModified, BlogPostSlug, ParentCommentId, IsOpen, BlogPostId } = req.body;

        db.run("INSERT INTO Comments (Email, Author, DisplayName, Url, Text, DateCreated, DateModified, BlogPostSlug, ParentCommentId, IsOpen, BlogPostId ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Email, Author, DisplayName, Url, Text, DateCreated, DateModified, BlogPostSlug, ParentCommentId, IsOpen, BlogPostId], (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: "Error saving data" });
            } else {





                res.json({ message: "Reply saved successfully" });
            }
        });
    });




}