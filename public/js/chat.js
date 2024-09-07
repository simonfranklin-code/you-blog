$(function () {
    var socket = io();

    // On form submission, send the message
    $('#chat-form').submit(function (e) {
        e.preventDefault(); // Prevent form from submitting the traditional way
        var message = $('#message-input').val();
        socket.emit('chatMessage', message); // Emit message to the server
        $('#message-input').val(''); // Clear the input field
        return false;
    });

    // Listen for incoming messages
    socket.on('chatMessage', function (data) {
        var msgTemplate = `
            <div class="direct-chat-msg end">
                <div class="direct-chat-infos clearfix">
                    <span class="direct-chat-name float-end">${data.username}</span>
                    <span class="direct-chat-timestamp float-start">${new Date()}</span>
                </div>
                <!-- /.direct-chat-infos-->
                <img class="direct-chat-img" src="/dist/assets/img/user3-128x128.jpg" alt="message user image" draggable="false">
                <!-- /.direct-chat-img-->
                <div class="direct-chat-text">
                    ${data.message}
                </div>
                <!-- /.direct-chat-text-->
            </div>
        `
        $('#messages').append(msgTemplate); // Append the message to the chat
    });

    // Send a private message
    $('#sendBtn').on('click', function () {
        var targetUserId = $('#targetUserId').val();
        var message = $('#message').val();

        // Emit private message to the server
        socket.emit('privateMessage', { to: targetUserId, message: message });
    });

    // Assuming socket is already connected
    function sendPrivateMessage(toSocketId, message) {
        socket.emit('privateMessage', { to: toSocketId, message: message });
    }

    // Listen for incoming private messages
    socket.on('privateMessage', function (data) {
        $('#messages').append(
            $('<li>').text(`From ${data.from}: ${data.message}`)
        );
    });
});