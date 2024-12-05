
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

        try {
            const url = req.baseUrl;
            const blogSlug = url.split('/')[2];
            const slug = url.split('/')[3];


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
                    `<section data-bs-version="5.1" class="features16 cid-ubyiHIN383" id="Reviews">
                    <div class="container-fluid">
                        <div class="content-wrapper">
                            <div class="row align-items-center">
                                <div class="col-12 col-lg">
                                    <div class="text-wrapper">

                                        <h6 class="text-white mbr-fonts-style display-5">Reviews:</h6>
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
                                                                <input type="hidden" name="Slug" id="Slug" value="${slug}">
                                                                <input type="hidden" name="BlogPostReviewId" id="BlogPostReviewId">
                                                                <div class="form-group mb-3">
                                                                    <label for="Rating">Rating</label>
                                                                    <input type="number" class="form-control form-control-sm" id="Rating" name="Rating" min="1" max="5" required>
                                                                </div>
                                                                <div class="form-group mb-3">
                                                                    <label for="Author">Name</label>
                                                                    <input type="text" class="form-control form-control-sm" id="Author" name="Author" required>
                                                                </div>
                                                                <div class="form-group mb-3">
                                                                    <label for="AuthorEmailAddress">Email</label>
                                                                    <input type="email" class="form-control form-control-sm" id="AuthorEmailAddress" name="AuthorEmailAddress" required>
                                                                </div>
                                                                <div class="form-group mb-3">
                                                                    <label for="ReviewText">Review</label>
                                                                    <textarea class="form-control form-control-sm" id="ReviewText" name="ReviewText" required></textarea>
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                                                    <button type="submit" class="btn btn-primary btn-sm">Save Review</button>
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
                                        <h6 class="text-white mbr-fonts-style display-5 mb-5"><strong>Comments</strong></h6>
                                        <p class="mbr-text mbr-fonts-style mb-4 display-7">We value your feedback and insights on this post. Feel free to share your thoughts and suggestions in the comments section below.<br></p>
                                        <div id="commentsArea"></div>
                                       

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
                    blogPost: blogPostFromSlug,
                    metaDescription: metaDescription,
                    metaKeywords: metaKeywords,
                    footer: footer
                });
            });
        } catch (e) {
            req.flash('error_msg', e.message);
            // Emit flash message to connected clients
            const flashMessage = req.flash('error_msg');
            req.io.emit('flash', { message: flashMessage, isError: true });
        }


    }

    getBlogPostSections();



}

