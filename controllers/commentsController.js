exports.getComments = (req, res) => {

    function getBlogPostComments() {
        var commentsSection = "";
        var blogPostId = 0;
        const sqlite3 = require('sqlite3').verbose();
        const baseUrl = req.baseUrl;
        var slug = baseUrl.split("/")['2'].toLowerCase();
        var db = new sqlite3.Database('C:\\Users\\Susana Rijo\\Source\\repos\\Smf\\YouBlog\\Server\\Digital-Marketing-Guru.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            let blogPostIdSql = 'SELECT BlogPostId FROM BlogPosts WHERE Slug = \'' + slug + '\'';
            
            db.all(blogPostIdSql, [], (err, blogPosts) => {
                
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                }
                
                blogPosts.forEach((blogPost) => {
                    blogPostId = blogPost.BlogPostId;

                });
            });
            console.log('Connected to the SQLite database.');
            let commentsSql = 'SELECT * FROM Comments WHERE BlogPostSlug = "' + slug + '" AND ParentCommentId = 0'
            db.all(commentsSql, [], (err, comments) => {
                var commentId = 0;
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                }
                commentsSection += '<a href = "javascript:OpenModal(\'modalAddCommentForm0\')" class="btn btn-primary btn-sm" >Add Comment</a>' +
                    '<div class="modal fade" id="modalAddCommentForm0" tabindex="-1" aria-labelledby="modalAddCommentForm0Label" aria-hidden="true">' +
                    '   <div class="modal-dialog" style="height:auto" role="document">' +
                    '       <div class="modal-content">' +
                    '           <div class="modal-header">' +
                    '               <h5 class="modal-title" id="modalReplyForm0Title">Add Comment</h5>' +
                    '               <a href="#" class="no-anim close" data-bs-dismiss="modal" data-dismiss="modal" aria-label="Close">' +
                    '                   <span aria-hidden="true">×</span>' +
                    '               </a>' +
                    '           </div>' +
                    '           <div class="modal-body">' +
                    '               <form style="display: block;" id="commentForm0">' +
                    '                   <div class="form-group">' +
                    '                       <label for="email">Email address</label>' +
                    '                       <input type="email" class="form-control form-control-sm" id="Email0" name="Email0" placeholder="your@email.com">' +
                    '                   </div>' +
                    '                   <div class="form-group">' +
                    '                       <label for="name">Full Name</label>' +
                    '                       <input type="text" class="form-control form-control-sm" id="Author0" name="Author0" placeholder="Full Name">' +
                    '                   </div>' +
                    '                   <div class="form-group">' +
                    '                       <label for="name">Display Name</label>' +
                    '                       <input type="text" class="form-control form-control-sm" id="DisplayName0" name="DisplayName0" placeholder="Display Name">' +
                    '                   </div>' +
                    '                   <div class="form-group">' +
                    '                       <label for="name">Website</label>' +
                    '                       <input type="text" class="form-control form-control-sm" id="Url0" name="Url0" placeholder="Website">' +
                    '                   </div>' +
                    '                   <div class="form-group">' +
                    '                       <label for="text">Comment Text</label>' +
                    '                       <textarea class="form-control" id="Text0" name="Text00" rows="2"></textarea>' +
                    '                   </div>' +
                    '                   <a href="javascript:submitCommentForm(\'0\');" class="no-anim btn btn-primary btn-sm display-4">Reply</a>' +
                    '                   <input Type="hidden" id="BlogPostSlug0" name="BlogPostSlug0" value="' + slug + '" />' +
                    '                   <input Type="hidden" id="ParentCommentId0" name="ParentCommentId0" value="0" />' +
                    '                   <input Type="hidden" id="IsOpen0" name="IsOpen0" value="true" />' +
                    '                   <input Type="hidden" id="BlogPostId0" name="BlogPostId0" value="' + blogPostId + '" />' +
                    '               </form > ' +
                    '           </div>' +
                    '           <div class="modal-footer">' +
                    '               <div class="mbr-section-btn">' +
                    '                   <a href = "#" class="no-anim btn btn-primary btn-sm display-4" data-bs-dismiss="modal" data-dismiss="modal" >Close</a>' +
                    '               </div>' +
                    '           </div>' +
                    '       </div>' +
                    '   </div>' +
                    '</div>';
                comments.forEach(async (comment) => {

                    commentsSection +=
                        '<h6 class="card-title mbr-fonts-style display-7 mt-1"><strong>Comment from ' + comment.Author + ':</strong></h6>' +
                        '<p class="mbr-text mbr-fonts-style mb-4 display-7">' + comment.Text + '</p>' +
                        '<p class="mbr-text mbr-fonts-style mb-1 display-7">Date Created: ' + comment.DateCreated + '</p>' +
                        '<p class="mbr-text mbr-fonts-style mb-1 display-7">Website: <a href="' + comment.Url + '" target="_new">' + comment.Url + '</a></p>' +
                        '<p class="mbr-text mbr-fonts-style mb-1 display-7">CommentId: ' + comment.CommentId + '</p>' +

                        '<a href = "javascript:OpenModal(\'modalReplyForm' + comment.CommentId + '\')" class="btn btn-primary btn-sm" >Reply</a >' +

                        '<h6 class="card-title mbr-fonts-style display-7"><strong>Replies:</strong></h6>' +

                        '<hr style="border-top: 1px solid #fafafa;" />' +
                        '<div class="row ml-5"> ' +
                        '   <div class="col-md-12">' +
                    '       <div id="' + comment.CommentId + '" style="margin-left: 25px;"></div>' +
                        '   </div>' +
                        '</div>' +


                    '<div class="modal fade" id="modalReplyForm' + comment.CommentId + '" tabindex="-1" aria-labelledby="modalReplyForm' + comment.CommentId + 'Label" aria-hidden="true">' +
                        '   <div class="modal-dialog" style="height:auto" role="document">' +
                        '       <div class="modal-content">' +
                        '           <div class="modal-header">' +
                        '               <h5 class="modal-title" id="modalReplyForm' + comment.CommentId + 'Title">Reply</h5>' +
                        '               <a href="#" class="no-anim close" data-bs-dismiss="modal" data-dismiss="modal" aria-label="Close">' +
                        '                   <span aria-hidden="true" >×</span >' +
                        '               </a>' +
                        '           </div>' +
                        '           <div class="modal-body">' +
                        '               <form style="display: block;" id="replyForm' + comment.CommentId + '">' +
                        '                   <div class="form-group">' +
                        '                       <label for="email">Email address</label>' +
                        '                       <input type="email" class="form-control form-control-sm" id="Email' + comment.CommentId + '" name="Email' + comment.CommentId + '" placeholder="your@email.com">' +
                        '                   </div>' +
                        '                   <div class="form-group">' +
                        '                       <label for="name">Full Name</label>' +
                        '                       <input type="text" class="form-control form-control-sm" id="Author' + comment.CommentId + '" name="Author' + comment.CommentId + '" placeholder="Full Name">' +
                        '                   </div>' +
                        '                   <div class="form-group">' +
                        '                       <label for="name">Display Name</label>' +
                        '                       <input type="text" class="form-control form-control-sm" id="DisplayName' + comment.CommentId + '" name="DisplayName' + comment.CommentId + '" placeholder="Full Name">' +
                        '                   </div>' +
                        '                   <div class="form-group">' +
                        '                       <label for="name">Website</label>' +
                        '                       <input type="text" class="form-control form-control-sm" id="Url' + comment.CommentId + '" name="Url' + comment.CommentId + '" placeholder="Website">' +
                        '                   </div>' +
                        '                   <div class="form-group">' +
                        '                       <label for="text">Comment Text</label>' +
                        '                       <textarea class="form-control" id="Text' + comment.CommentId + '" name="Text' + comment.CommentId + '' + comment.CommentId + '" rows="2"></textarea>' +
                        '                   </div>' +
                        '                   <a href="javascript:submitReplyForm(\'' + comment.CommentId + '\');" class="no-anim btn btn-primary btn-sm display-4">Reply</a>' +
                        '                   <input Type="hidden" id="BlogPostSlug' + comment.CommentId + '" name="BlogPostSlug' + comment.CommentId + '" value="' + comment.BlogPostSlug + '" />' +
                        '                   <input Type="hidden" id="ParentCommentId' + comment.CommentId + '" name="ParentCommentId' + comment.CommentId + '" value="' + comment.CommentId + '" />' +
                        '                   <input Type="hidden" id="IsOpen' + comment.CommentId + '" name="IsOpen' + comment.CommentId + '" value="true" />' +
                        '                   <input Type="hidden" id="BlogPostId' + comment.CommentId + '" name="BlogPostId' + comment.CommentId + '" value="' + comment.BlogPostId + '" />' +
                        '               </form > ' +
                        '           </div>' +
                        '           <div class="modal-footer">' +
                        '               <div class="mbr-section-btn">' +
                        '                   <a href = "#" class="no-anim btn btn-primary btn-sm display-4" data-bs-dismiss="modal" data-dismiss="modal" >Close</a>' +
                        '               </div>' +
                        '           </div>' +
                        '       </div>' +
                        '   </div>' +
                        '</div>';  



                });
                var result = {
                    comments: comments,
                    commentsSection: commentsSection
                };
                res.json(result);
            });


        });

    }
    getBlogPostComments();
};