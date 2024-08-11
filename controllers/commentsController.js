const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const NotificationStats = require('../models/NotificationStats');

exports.getComments = async (req, res) => {
    try {
        const slug = req.params.slug;
        const blogPostId = await Comment.getBlogPostId(slug);
        const comments = await Comment.getComments(slug);
        
        let commentsSection = `
            <a href="javascript:OpenModal('modalAddCommentForm0')" class="btn btn-primary btn-sm">Add Comment</a>
            <div class="modal fade" id="modalAddCommentForm0" tabindex="-1" aria-labelledby="modalAddCommentForm0Label" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add Comment</h5>
                            <a href="#" class="no-anim close" data-bs-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </a>
                        </div>
                        <div class="modal-body">
                            <form id="commentForm0">
                                <div class="form-group">
                                    <label for="email">Email address</label>
                                    <input type="email" class="form-control form-control-sm" id="Email0" name="Email0" placeholder="your@email.com">
                                </div>
                                <div class="form-group">
                                    <label for="name">Full Name</label>
                                    <input type="text" class="form-control form-control-sm" id="Author0" name="Author0" placeholder="Full Name">
                                </div>
                                <div class="form-group">
                                    <label for="name">Display Name</label>
                                    <input type="text" class="form-control form-control-sm" id="DisplayName0" name="DisplayName0" placeholder="Display Name">
                                </div>
                                <div class="form-group">
                                    <label for="name">Website</label>
                                    <input type="text" class="form-control form-control-sm" id="Url0" name="Url0" placeholder="Website">
                                </div>
                                <div class="form-group">
                                    <label for="CodeLanguage0">Language</label>
                                    <select class="form-control form-control-sm" id="CodeLanguage0" name="language">
                                        <option value='css'>CSS</option>
                                        <option value='javascript'>JavaScript</option>
                                        <option value='html'>Html</option>
                                        <option value='text'>Plain text</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="text">Comment Text</label>
                                    <textarea class="form-control" id="Text0" name="Text00" rows="2"></textarea>
                                </div>
                                <a href="javascript:submitCommentForm('0');" class="no-anim btn btn-primary btn-sm display-4">Reply</a>
                                <input type="hidden" id="BlogPostSlug0" name="BlogPostSlug0" value="${slug}">
                                <input type="hidden" id="ParentCommentId0" name="ParentCommentId0" value="0">
                                <input type="hidden" id="IsOpen0" name="IsOpen0" value="true">
                                <input type="hidden" id="BlogPostId0" name="BlogPostId0" value="${blogPostId}">
                                <input type="hidden" id="UserId0" name="UserId0" value="${req.user.id}">
                            </form>
                        </div>
                        <div class="modal-footer">
                            <a href="#" class="no-anim btn btn-primary btn-sm display-4" data-bs-dismiss="modal">Close</a>
                        </div>
                    </div>
                </div>
            </div>`;

        comments.forEach(comment => {
            
            commentsSection += `
                <div id="commentContainer${comment.CommentId}">
                    <h6 class="card-title mbr-fonts-style display-7 mt-1" id="commentTitle${comment.CommentId}">
                        <strong>Comment from ${comment.Author}:</strong>
                    </h6>
                    <p class="mbr-text mbr-fonts-style mb-4 display-7">${comment.Text}</p>
                    <p class="mbr-text mbr-fonts-style mb-1 display-7">Date Created: ${comment.DateCreated}</p>
                    <p class="mbr-text mbr-fonts-style mb-1 display-7">Website: <a href="${comment.Url}" target="_new">${comment.Url}</a></p>
                    <p class="mbr-text mbr-fonts-style mb-1 display-7">CommentId: ${comment.CommentId}</p>
                    <a href="javascript:OpenModal('modalReplyForm${comment.CommentId}')" class="btn btn-primary btn-sm">Reply</a>
                    <a href="javascript:deleteComment(${comment.CommentId})" class="btn btn-primary btn-sm">Delete</a>
                    <a href="javascript:likeComment(${comment.CommentId})"><i class="fas fa-thumbs-up"></i></a>
                    <a href="javascript:unlikeComment(${comment.CommentId})"><i class="fas fa-thumbs-down"></i></a>
                    <span class="mbr-text mbr-fonts-style display-7" id="commentLikesCount${comment.CommentId}">0</span>
                    <h6 class="card-title mbr-fonts-style display-7"><strong>Replies:</strong></h6>
                    <hr style="border-top: 1px solid #fafafa;">
                    <div class="row ml-5">
                        <div class="col-md-12">
                            <div id="${comment.CommentId}" style="margin-left: 25px;"></div>
                        </div>
                    </div>
                    <div class="modal fade" id="modalReplyForm${comment.CommentId}" tabindex="-1" aria-labelledby="modalReplyForm${comment.CommentId}Label" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Reply</h5>
                                    <a href="#" class="no-anim close" data-bs-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </a>
                                </div>
                                <div class="modal-body">
                                    <form id="replyForm${comment.CommentId}">
                                        <div class="form-group">
                                            <label for="email">Email address</label>
                                            <input type="email" class="form-control form-control-sm" id="Email${comment.CommentId}" name="Email${comment.CommentId}" placeholder="your@email.com">
                                        </div>
                                        <div class="form-group">
                                            <label for="name">Full Name</label>
                                            <input type="text" class="form-control form-control-sm" id="Author${comment.CommentId}" name="Author${comment.CommentId}" placeholder="Full Name">
                                        </div>
                                        <div class="form-group">
                                            <label for="name">Display Name</label>
                                            <input type="text" class="form-control form-control-sm" id="DisplayName${comment.CommentId}" name="DisplayName${comment.CommentId}" placeholder="Full Name">
                                        </div>
                                        <div class="form-group">
                                            <label for="name">Website</label>
                                            <input type="text" class="form-control form-control-sm" id="Url${comment.CommentId}" name="Url${comment.CommentId}" placeholder="Website">
                                        </div>
                                        <div class="form-group">
                                            <label for="language">Language</label>
                                            <select class="form-control form-control-sm" id="CodeLanguage${comment.CommentId}" name="CodeLanguage${comment.CommentId}">
                                                <option value='css'>CSS</option>
                                                <option value='javascript'>JavaScript</option>
                                                <option value='html'>Html</option>
                                                <option value='text'>Plain text</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="text">Comment Text</label>
                                            <textarea class="form-control" id="Text${comment.CommentId}" name="Text${comment.CommentId}" rows="2"></textarea>
                                        </div>
                                        <a href="javascript:submitReplyForm('${comment.CommentId}');" class="no-anim btn btn-primary btn-sm display-4">Reply</a>
                                        <input type="hidden" id="BlogPostSlug${comment.CommentId}" name="BlogPostSlug${comment.CommentId}" value="${comment.BlogPostSlug}">
                                        <input type="hidden" id="ParentCommentId${comment.CommentId}" name="ParentCommentId${comment.CommentId}" value="${comment.CommentId}">
                                        <input type="hidden" id="IsOpen${comment.CommentId}" name="IsOpen${comment.CommentId}" value="true">
                                        <input type="hidden" id="BlogPostId${comment.CommentId}" name="BlogPostId${comment.CommentId}" value="${comment.BlogPostId}">
                                        <input type="hidden" id="UserId${comment.CommentId}" name="UserId${comment.CommentId}" value="${req.user.id}">
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <a href="#" class="no-anim btn btn-primary btn-sm display-4" data-bs-dismiss="modal">Close</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        res.json({ comments, commentsSection });
    } catch (err) {
        Comment.logError(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.getReplies = async (req, res) => {
    try {
        const { slug, commentId } = req.params;
        const blogPostId = await Comment.getBlogPostId(slug);
        const replies = await Comment.getReplies(slug, commentId);
        let htmlReplies = '';

        replies.forEach(async reply => {
            htmlReplies += `
            <div id="commentContainer${reply.CommentId}">
                <h6 class="card-title mbr-fonts-style display-7 mt-1" id="commentTitle${reply.CommentId}">
                    <strong>Reply from ${reply.Author}:</strong>
                </h6>
                <p class="mbr-text mbr-fonts-style mb-4 display-7">${reply.Text}</p>
                <p class="mbr-text mbr-fonts-style mb-1 display-7">Date Created: ${reply.DateCreated}</p>
                <p class="mbr-text mbr-fonts-style mb-1 display-7">Website: <a href="${reply.Url}" target="_new">${reply.Url}</a></p>
                <p class="mbr-text mbr-fonts-style mb-1 display-7">CommentId: ${reply.CommentId}</p>
                <a href="javascript:OpenModal('modalReplyForm${reply.CommentId}')" class="btn btn-primary btn-sm">Reply</a>
                <a href="javascript:deleteComment(${reply.CommentId})" class="btn btn-primary btn-sm">Delete</a>
                <a href="javascript:likeComment(${reply.CommentId})"><i class="fas fa-thumbs-up"></i></a>
                <a href="javascript:unlikeComment(${reply.CommentId})"><i class="fas fa-thumbs-down"></i></a>
                <span class="mbr-text mbr-fonts-style display-7" id="commentLikesCount${reply.CommentId}">0  likes</span>
                <h6 class="card-title mbr-fonts-style display-7"><strong>Replies:</strong></h6>
                <hr style="border-top: 1px solid #fafafa;">
                <div class="row ml-5">
                    <div class="col-md-12">
                        <div id="${reply.CommentId}" style="margin-left: 25px;"></div>
                    </div>
                </div>
                <div class="modal fade" id="modalReplyForm${reply.CommentId}" tabindex="-1" aria-labelledby="replyForm${reply.CommentId}Label" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Reply</h5>
                                <a href="#" class="no-anim close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </a>
                            </div>
                            <div class="modal-body">
                                <form id="replyForm${reply.CommentId}">
                                    <div class="form-group">
                                        <label for="email">Email address</label>
                                        <input type="email" class="form-control form-control-sm" id="Email${reply.CommentId}" name="Email${reply.CommentId}" placeholder="your@email.com">
                                    </div>
                                    <div class="form-group">
                                        <label for="name">Full Name</label>
                                        <input type="text" class="form-control form-control-sm" id="Author${reply.CommentId}" name="Author${reply.CommentId}" placeholder="Full Name">
                                    </div>
                                    <div class="form-group">
                                        <label for="name">Display Name</label>
                                        <input type="text" class="form-control form-control-sm" id="DisplayName${reply.CommentId}" name="DisplayName${reply.CommentId}" placeholder="Full Name">
                                    </div>
                                    <div class="form-group">
                                        <label for="name">Website</label>
                                        <input type="text" class="form-control form-control-sm" id="Url${reply.CommentId}" name="Url${reply.CommentId}" placeholder="Website">
                                    </div>
                                    <div class="form-group">
                                        <label for="CodeLanguage${reply.CommentId}">Language</label>
                                        <select class="form-control form-control-sm" id="CodeLanguage${reply.CommentId}" name="CodeLanguage${reply.CommentId}">
                                            <option value='css'>CSS</option>
                                            <option value='javascript'>JavaScript</option>
                                            <option value='html'>Html</option>
                                            <option value='text'>Plain text</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="text">Comment Text</label>
                                        <textarea class="form-control" id="Text${reply.CommentId}" name="Text${reply.CommentId}" rows="2"></textarea>
                                    </div>
                                    <a href="javascript:submitReplyForm('${reply.CommentId}');" class="no-anim btn btn-primary btn-sm display-4">Reply</a>
                                    <input type="hidden" id="BlogPostSlug${reply.CommentId}" name="BlogPostSlug${reply.CommentId}" value="${reply.BlogPostSlug}">
                                    <input type="hidden" id="ParentCommentId${reply.CommentId}" name="ParentCommentId${reply.CommentId}" value="${reply.CommentId}">
                                    <input type="hidden" id="IsOpen${reply.CommentId}" name="IsOpen${reply.CommentId}" value="true">
                                    <input type="hidden" id="BlogPostId${reply.CommentId}" name="BlogPostId${reply.CommentId}" value="${blogPostId}">
                                    <input type="hidden" id="UserId${reply.CommentId}" name="UserId${reply.CommentId}" value="${req.user.id}">
                                </form>
                            </div>
                            <div class="modal-footer">
                                <a href="#" class="no-anim btn btn-primary btn-sm display-4" data-bs-dismiss="modal">Close</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        res.json({ replies, htmlReplies });
    } catch (err) {
        Comment.logError(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.getRepliesJSON = async (req, res) => {
    try {
        const { slug, commentId } = req.params;
        //const blogPostId = await Comment.getBlogPostId(slug);
        const replies = await Comment.getReplies(slug, commentId);
        res.json({ replies });
    } catch (err) {
        Comment.logError(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.addCommentReply = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const commentId = await Comment.addCommentReply(req.body);
        const comment = await Comment.getCommentById(commentId);
        
        if (comment) {
            //await NotificationStats.incrementStat(req.user.id, 'Comments');
            let likesCount = await Like.getCommentLikesCount(comment,commentId);
            let commentSection = `
                <div id='commentContainer${ comment.CommentId}'>
                    <h6 class="card-title mbr-fonts-style display-7 mt-1" id="commentTitle${comment.CommentId}">
                        <strong>Comment from ${comment.Author}:</strong>
                    </h6>
                    <p class="mbr-text mbr-fonts-style mb-4 display-7">${comment.Text}</p>
                    <p class="mbr-text mbr-fonts-style mb-1 display-7">Date Created: ${comment.DateCreated}</p>
                    <p class="mbr-text mbr-fonts-style mb-1 display-7">Website: <a href="${comment.Url}" target="_new">${comment.Url}</a></p>
                    <p class="mbr-text mbr-fonts-style mb-1 display-7">CommentId: ${comment.CommentId}</p>
                    <a href="javascript:OpenModal('modalReplyForm${comment.CommentId}')" class="btn btn-primary btn-sm">Reply</a>
                    <a href="javascript:deleteComment(${comment.CommentId})" class="btn btn-primary btn-sm">Delete</a>
                    <a href="javascript:likeComment(${comment.CommentId})"><i class="fas fa-thumbs-up"></i></a>
                    <a href="javascript:unlikeComment(${comment.CommentId})"><i class="fas fa-thumbs-down"></i></a>
                    <span class="mbr-text mbr-fonts-style display-7" id="commentLikesCount${comment.CommentId}">${likesCount} likes</span>
                    <h6 class="card-title mbr-fonts-style display-7"><strong>Replies:</strong></h6>
                    <hr style="border-top: 1px solid #fafafa;">
                    <div class="row ml-5">
                        <div class="col-md-12">
                            <div id="${comment.CommentId}" style="margin-left: 25px;"></div>
                        </div>
                    </div>
                    <div class="modal fade" id="modalReplyForm${comment.CommentId}" tabindex="-1" aria-labelledby="modalReplyForm${comment.CommentId}Label" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Reply</h5>
                                    <a href="#" class="no-anim close" data-bs-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </a>
                                </div>
                                <div class="modal-body">
                                    <form id="replyForm${comment.CommentId}">
                                        <div class="form-group">
                                            <label for="email">Email address</label>
                                            <input type="email" class="form-control form-control-sm" id="Email${comment.CommentId}" name="Email${comment.CommentId}" placeholder="your@email.com">
                                        </div>
                                        <div class="form-group">
                                            <label for="name">Full Name</label>
                                            <input type="text" class="form-control form-control-sm" id="Author${comment.CommentId}" name="Author${comment.CommentId}" placeholder="Full Name">
                                        </div>
                                        <div class="form-group">
                                            <label for="name">Display Name</label>
                                            <input type="text" class="form-control form-control-sm" id="DisplayName${comment.CommentId}" name="DisplayName${comment.CommentId}" placeholder="Full Name">
                                        </div>
                                        <div class="form-group">
                                            <label for="name">Website</label>
                                            <input type="text" class="form-control form-control-sm" id="Url${comment.CommentId}" name="Url${comment.CommentId}" placeholder="Website">
                                        </div>
                                        <div class="form-group">
                                            <label for="CodeLanguage${comment.CommentId}">Language</label>
                                            <select class="form-control form-control-sm" id="CodeLanguage${comment.CommentId}" name="CodeLanguage${comment.CommentId}">
                                                <option value='css'>CSS</option>
                                                <option value='javascript'>JavaScript</option>
                                                <option value='html'>Html</option>
                                                <option value='text'>Plain text</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="text">Comment Text</label>
                                            <textarea class="form-control" id="Text${comment.CommentId}" name="Text${comment.CommentId}" rows="3"></textarea>
                                        </div>
                                        <a href="javascript:submitReplyForm('${comment.CommentId}');" class="no-anim btn btn-primary btn-sm display-4">Reply</a>
                                        <input type="hidden" id="BlogPostSlug${comment.CommentId}" name="BlogPostSlug${comment.CommentId}" value="${comment.BlogPostSlug}">
                                        <input type="hidden" id="ParentCommentId${comment.CommentId}" name="ParentCommentId${comment.CommentId}" value="${comment.CommentId}">
                                        <input type="hidden" id="IsOpen${comment.CommentId}" name="IsOpen${comment.CommentId}" value="true">
                                        <input type="hidden" id="BlogPostId${comment.CommentId}" name="BlogPostId${comment.CommentId}" value="${comment.BlogPostId}">
                                        <input type="hidden" id="UserId${comment.CommentId}" name="UserId${comment.CommentId}" value="${req.user.id}">
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <a href="#" class="no-anim btn btn-primary btn-sm display-4" data-bs-dismiss="modal">Close</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            res.json({ commentSection, comment });
        } else {
            res.status(500).send('Error retrieving the newly added comment');
        }
    } catch (err) {
        Comment.logError(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const result = await Comment.deleteComment(commentId);
        if (result > 0) {
            res.json({ success: true, message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Comment not found' });
        }
    } catch (err) {
        Comment.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.deleteReplies = async (req, res) => {
    try {
        const parentCommentId = req.params.parentCommentId;
        const result = await Comment.deleteReplies(parentCommentId);
        if (result > 0) {
            res.json({ success: true, message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Comment not found' });
        }
    } catch (err) {
        Comment.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

