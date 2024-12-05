$(function () {
    var socket = io();
    var msgCount = 0;
    var cls = 'end';
    // On form submission, send the message
    $('#chat-form').submit(function (e) {
        e.preventDefault(); // Prevent form from submitting the traditional way
        var message = $('#message-input').val();
        socket.emit('chatMessage', message); // Emit message to the server
        $('#message-input').val(''); // Clear the input field
        return false;
    });

    // Listen for user online event
    socket.on('user-online', (data) => {
        console.log(`${data.username} is online`);
        // Update your UI to show the user is online
        msgCount += 1;
        if (msgCount % 2 === 0) {
            cls = '';
        } else {
            cls = 'end';
        }
        var msgTemplate = `
            <div class="direct-chat-msg ${cls}">
                <div class="direct-chat-infos clearfix">
                    <span class="direct-chat-name float-end">${data.username}</span>
                    <span class="direct-chat-timestamp float-start">${new Date().toISOString()}</span>
                </div>
                <!-- /.direct-chat-infos-->
                <img class="direct-chat-img" src="${data.avatar}" alt="message user image" draggable="false">
                <!-- /.direct-chat-img-->
                <div class="direct-chat-text">
                    ${data.username} is online
                </div>
                <!-- /.direct-chat-text-->
            </div>
        `
        $('#messages').append(msgTemplate); // Append the message to the chat
    });

    // Listen for user offline event
    socket.on('user-offline', (data) => {
        console.log(`${data.username} is offline`);
        // Update your UI to show the user is offline
        sgCount += 1;
        if (msgCount % 2 === 0) {
            cls = '';
        } else {
            cls = 'end';
        }
        var msgTemplate = `
            <div class="direct-chat-msg ${cls}">
                <div class="direct-chat-infos clearfix">
                    <span class="direct-chat-name float-end">${data.username}</span>
                    <span class="direct-chat-timestamp float-start">${new Date().toISOString()}</span>
                </div>
                <!-- /.direct-chat-infos-->
                <img class="direct-chat-img" src="${data.avatar}" alt="message user image" draggable="false">
                <!-- /.direct-chat-img-->
                <div class="direct-chat-text">
                    ${data.username} is offline
                </div>
                <!-- /.direct-chat-text-->
            </div>
        `
        $('#messages').append(msgTemplate); // Append the message to the chat
    });

    // Listen for incoming messages
    socket.on('chatMessage', function (data) {
        msgCount += 1;
        if (msgCount % 2 === 0) {
            cls = '';
        } else {
            cls = 'end';
        }
        var msgTemplate = `
            <div class="direct-chat-msg ${cls}">
                <div class="direct-chat-infos clearfix">
                    <span class="direct-chat-name float-end">${data.username}</span>
                    <span class="direct-chat-timestamp float-start">${new Date().toISOString()}</span>
                </div>
                <!-- /.direct-chat-infos-->
                <img class="direct-chat-img" src="${data.avatar}" alt="message user image" draggable="false">
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
    $('#send_btn').on('click', function (e) {
        e.preventDefault();
        var targetUserId = $('#targetUserId').val();
        var message = $('#message').val();

        // Emit private message to the server
        socket.emit('privateMessage', { to: targetUserId, message: message });
    });

    // Assuming socket is already connected
    function sendPrivateMessage(toSocketId, message) {
        socket.emit('privateMessage', { to: toSocketId, message: message });
    }
    // Listen for flash messages
    socket.on('flash', function (data) {
        // Create a Bootstrap Toast dynamically
        const toastHTML = `
                <div class="toast show ${!data.isError ? 'text-bg-primary': 'text-bg-danger'}  border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto">Notification</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        ${data.message}
                    </div>
                </div>
            `;
       $('#toast-container').append(toastHTML);

        // Initialize and show the toast
        const toastEl = document.querySelector('.toast');
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    });

    // Listen for incoming private messages
    socket.on('privateMessage', function (data) {
        msgCount += 1;
        if (msgCount % 2 === 0) {
            cls = '';
        } else {
            cls = 'end';
        }
        var msgTemplate = `
            <div class="direct-chat-msg ${cls}">
                <div class="direct-chat-infos clearfix">
                    <span class="direct-chat-name float-end">${data.from}</span>
                    <span class="direct-chat-timestamp float-start">${new Date().toISOString()}</span>
                </div>
                <!-- /.direct-chat-infos-->
                <img class="direct-chat-img" src="${data.userWithAvatar.Avatar}" alt="message user image" draggable="false">
                <!-- /.direct-chat-img-->
                <div class="direct-chat-text">
                    ${data.message}
                </div>
                <!-- /.direct-chat-text-->
            </div>
        `
        $('#messages').append(msgTemplate); // Append the message to the chat
    });
});