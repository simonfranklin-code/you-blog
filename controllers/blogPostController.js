
exports.getBlogPost = (req, res) => {

    var commentsSection = "";
    var htmlReplies = "";
    String.prototype.format = function (commentId, htmlReplies) {

        return this.replace('<div data-commentId="' + commentId +'"></div>', htmlReplies);
    };

    function createDynamicRegex(input) {
        const dynamicPart = input; // Your dynamic variable
        const regexPattern = new RegExp(`<div data-commentId=\"${dynamicPart}\"><\/div>`, 'g');
        return regexPattern;
    }




    String.prototype.formatReplies = function (html, commentId) {


        return this.replace('/{(' + commentId + '+)}/g', function (match, html) {

            return typeof html == 'undefined' ? match : html;
        });
    };
    function getBlogPostSections() {


        const sqlite3 = require('sqlite3').verbose();
        const slug = req.baseUrl;
        var slugValue = slug.split("/")['2'].toLowerCase();

        var db = new sqlite3.Database('C:\\Users\\Susana Rijo\\Source\\repos\\Smf\\YouBlog\\Server\\Digital-Marketing-Guru.db', (err) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Connected to the SQLite database.');



            let sql = 'SELECT * FROM HtmlSections WHERE Slug = "' + slugValue + '" ORDER BY ViewIndex';

            db.all(sql, [], (err, rows) => {
                var htmlContent = ""
                if (err) {
                    throw err;
                }
                rows.forEach(async (row) => {
                    htmlContent += row["Html"];
                });
                htmlContent +=
                    '<section data-bs-version="5.1" class="features16 cid-ubyiKXLyQh" id="comments-section">' +
                    '   <div class="container-fluid">' +
                    '       <div class="content-wrapper">' +
                    '           <div class="row align-items-center">' +
                    '               <div class="col-12 col-lg">' +
                    '                   <div class="text-wrapper"><h6 class="card-title mbr-fonts-style display-5 mb-5"><strong>Comments</strong></h6>' +
                    '                       <div id="comments"></div>' +


                    '                   </div>' +
                    '               </div>' +
                    '           </div>' +
                    '       </div>' +
                    '   </div>' +
                    '</section>';
                res.render('blog-post', { htmlContent: htmlContent });
            });
        });

    }

    getBlogPostSections();



}