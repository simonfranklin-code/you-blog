$(window).on("load", function () {
    var url = window.location.pathname;
    var slug = url.split("/")['2'].toLowerCase();
    var comments = {};
    if (url.includes('blog-post') ) {
        $.ajax({
            url: '/comments/' + slug,
            header: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            method: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            mimeType: 'text/json',
            data: '',
            beforeSend: function () {

            },
            success: function (data) {

                $('#comments').html(data.commentsSection);
                comments = data.comments;

            },
            complete: function () {
                comments.forEach(async (comment) => {
                    getReplies(comment);
                });

            }
        });
    }
});

function getReplies(comment) {
    var url = window.location.pathname;
    var slug = url.split("/")['2'].toLowerCase();
    var replies = {};
    $.ajax({
        url: '/replies/' + slug + '/' + comment.CommentId,
        header: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        method: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        mimeType: 'text/json',
        data: '',
        beforeSend: function () {

        },
        success: function (data) {

            $('#' + comment.CommentId).html(data.htmlReplies);
            replies = data.replies;

        },
        complete: function () {

            replies.forEach(async (reply) => {

                getReplies(reply)
            });
        }
    });
}

function submitReplyForm(CommentId, blogPostId) {
    try {
        var formData = {
            Email: $("#Email" + CommentId).val(),
            Author: $("#Author" + CommentId).val(),
            DisplayName: $("#DisplayName" + CommentId).val(),
            Url: $("#Url" + CommentId).val(),
            Text: $("#Text" + CommentId).val(),
            DateCreated: new Date(),
            DateModified: new Date(),
            BlogPostSlug: $("#BlogPostSlug" + CommentId).val(),
            ParentCommentId: $("#ParentCommentId" + CommentId).val(),
            IsOpen: $("#IsOpen" + CommentId).val(),
            BlogPostId: $("#BlogPostId" + CommentId).val(),
        };

        $.ajax({
            url: '/addCommentReply',
            type: 'POST',
            cache: false,
            data: formData,
            success: function (data) {
                //alert('Your reply was saved successfully!');
                var myModalEl = $("#modalReplyForm" + CommentId);
                var modal = bootstrap.Modal.getInstance(myModalEl)
                modal.hide();
                try {
                    $('#' + data.comment.ParentCommentId).append(data.commentSection);
                    var url = window.location.pathname + '#commentTitle' + data.comment.CommentId;
                    window.location.href = url;
                } catch (err) {
                    alert(JSON.stringify(err));
                }
            },
            error: function (err) {
                if (err.responseJSON !== 'undefined') {
                    if (err.responseJSON.errors !== 'undefined') {
                        var errorMessage = "";
                        err.responseJSON.errors.forEach((error) => {
                            errorMessage += error.path + ': ' + error.msg + ': ' + error.value + '\n'
                        });
                        alert(errorMessage);
                    }
                } else {
                    alert(JSON.stringify(err));
                }
            }
        });

    } catch (e) {
        alert(JSON.stringify(e));
    }
}

function submitCommentForm(CommentId) {
    try {

        var formData = {
            Email: $("#Email0").val(),
            Author: $("#Author0").val(),
            DisplayName: $("#DisplayName0").val(),
            Url: $("#Url0").val(),
            Text: $("#Text0").val(),
            DateCreated: new Date(),
            DateModified: new Date(),
            BlogPostSlug: $("#BlogPostSlug0").val(),
            ParentCommentId: CommentId,
            IsOpen: $("#IsOpen0").val(),
            BlogPostId: $("#BlogPostId0").val(),
        };

        $.ajax({
            url: '/addCommentReply',
            type: 'POST',
            cache: false,
            data: formData,
            success: function (data) {


                //alert('Your comment was saved successfully!');
                var myModalEl = $("#modalAddCommentForm0");
                var modal = bootstrap.Modal.getInstance(myModalEl)
                modal.hide();
                $('#comments').append(data.commentSection);
                var url = window.location.pathname + '#commentTitle' + data.comment.CommentId;
                window.location.href = url;
            },
            error: function (err) {
                if (err.responseJSON !== 'undefined') {
                    if (err.responseJSON.errors !== 'undefined') {
                        var errorMessage = "";
                        err.responseJSON.errors.forEach((error) => {
                            errorMessage += error.path + ': ' + error.msg + ': ' + error.value + '\n'
                        });
                        alert(errorMessage);
                    }
                } else {
                    alert(JSON.stringify(err));
                }
            }
        });

    } catch (e) {
        alert(JSON.stringify(e));
    }
}