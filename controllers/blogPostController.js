
exports.getBlogPost = (req, res) => {
    const db = require('../models/db');
    const blog = require('../models/Blog')
    const blogPost = require('../models/BlogPost');
    var commentsSection = "";
    var htmlReplies = "";
    String.prototype.format = function (commentId, htmlReplies) {

        return this.replace(`<div data-commentId="${commentId}"></div>`, htmlReplies);
    };

    function createDynamicRegex(input) {
        const dynamicPart = input; // Your dynamic variable
        const regexPattern = new RegExp(`<div data-commentId=\"${dynamicPart}\"><\/div>`, 'g');
        return regexPattern;
    }




    String.prototype.formatReplies = function (html, commentId) {


        return this.replace(`/{(${commentId}+)}/g`, function (match, html) {

            return typeof html == 'undefined' ? match : html;
        });
    };
    async function getBlogPostSections() {

        const url = req.baseUrl;
        const blogSlug = url.split('/')[2];
        const slug = url.split('/')[4];
        
        //const slug = req.params.slug;
        console.log('Connected to the SQLite database.');
        const blogPostFromSlug = await blogPost.getBlogPostBySlug(slug);
        const blogPostTitle = blogPostFromSlug.Title;
        const metaDescription = blogPostFromSlug.MetaDescription;
        const metaKeywords = blogPostFromSlug.MetaKeywords;
        const blogFromSlug = await blog.getBlogBySlug(blogSlug);
        const footer = blogPostFromSlug.Footer;
        const beforeEndOfBodyScript = blogPostFromSlug.beforeEndOfBodyScript;
        let sql = 'SELECT * FROM HtmlSections WHERE Slug = ? ORDER BY ViewIndex ASC';

        db.all(sql, [slug.toLowerCase()], (err, rows) => {
            var htmlContent = ""
            if (err) {
                throw err;
            }
            rows.forEach(async (row) => {
                htmlContent += row["Html"];
            });
            htmlContent +=
                `<section data-bs-version="5.1" class="features16 cid-reviews" id="Reviews">
                    <div class="container-fluid">
                        <div class="content-wrapper">
                            <div class="row align-items-center">
                                <div class="col-12 col-lg">
                                    <div class="text-wrapper">
                                        <h6 class="card-title mbr-fonts-style display-5">Reviews:</h6>
                                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#reviewModal">Add Review</button>
                                        <div id="reviewsContainer"></div>
                                            <!-- Bootstrap 5 Modal for adding/editing a review -->
                                            <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
                                                <div class="modal-dialog">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="reviewModalLabel">Add Review</h5>
                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form id="reviewForm">
                                                                <input type="hidden" name="Slug" value="${slug}">
                                                                <input type="hidden" name="BlogPostReviewId" id="BlogPostReviewId">
                                                                <div class="form-group mb-3">
                                                                    <label for="Rating">Rating</label>
                                                                    <input type="number" class="form-control" name="Rating" min="1" max="5" required>
                                                                </div>
                                                                <div class="form-group mb-3">
                                                                    <label for="Author">Name</label>
                                                                    <input type="text" class="form-control" name="Author" required>
                                                                </div>
                                                                <div class="form-group mb-3">
                                                                    <label for="AuthorEmailAddress">Email</label>
                                                                    <input type="email" class="form-control" name="AuthorEmailAddress" required>
                                                                </div>
                                                                <div class="form-group mb-3">
                                                                    <label for="ReviewText">Review</label>
                                                                    <textarea class="form-control" name="ReviewText" required></textarea>
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                                    <button type="submit" class="btn btn-primary">Save Review</button>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
                `


            htmlContent +=
                `<section data-bs-version="5.1" class="features16 cid-comments" id="comments-section">
                   <div class="container-fluid">
                       <div class="content-wrapper">
                           <div class="row align-items-center">
                               <div class="col-12 col-lg">
                                   <div class="text-wrapper">
                                        <h6 class="card-title mbr-fonts-style display-5 mb-5"><strong>Comments</strong></h6>
                                        <p class="mbr-text mbr-fonts-style mb-4 display-7 animate__animated animate__delay-1s animate__fadeInUp">We value your feedback and insights on this post. Feel free to share your thoughts and suggestions in the comments section below.<br></p>
                                        <div id="comments"></div>
                                       

                                   </div>
                              </div>
                           </div>
                       </div>
                   </div>
                </section>`

            res.render('blog-post', {
                htmlContent: htmlContent,
                title: blogPostTitle,
                blog: blogFromSlug,
                metaDescription: metaDescription,
                metaKeywords: metaKeywords,
                footer: footer
            });
        });


    }

    getBlogPostSections();



}