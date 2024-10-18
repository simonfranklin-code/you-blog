$('#searchUserForm').on('submit', function (event) {
    event.preventDefault();
    const searchInput = $('#search').val();

    $.ajax({
        url: '/friends/search',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ search: searchInput }),
        success: function (data) {
            const resultsContainer = $('#userSearchResults');
            resultsContainer.empty();

            if (data.users && data.users.length > 0) {
                data.users.forEach(user => {
                    const userItem = $(`
            <li class="list-group-item">
              <div>
                <img class="rounded-circle shadow" style="margin: 0 auto;text-align: center; height:32px;width: 32px;" src="${ user.avatar }" alt="User Image">&nbsp;<strong>${user.username}</strong> (${user.email})&nbsp;
                <button class="btn btn-primary btn-sm float-right" onclick="sendFriendRequest(${user.id})">Add Friend</button>
              </div>
            </li>
          `);
                    resultsContainer.append(userItem);
                });
            } else {
                const noResultsItem = $('<li class="list-group-item">No users found</li>');
                resultsContainer.append(noResultsItem);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error searching for users:', error);
        }
    });
});

function sendFriendRequest(userId) {
    $.ajax({
        url: '/friends/request', // Server endpoint to send a friend request
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ receiverId: userId }), // Pass the userId in the request body
        success: function (response) {
            if (response.success) {
                alert('Friend request sent successfully!');
                console.log(`Friend request sent to user ID: ${userId}`);
            }

            
            
        },
        error: function (xhr, status, error) {
            // Handle error response
            alert('Failed to send friend request. Please try again.');
            console.error('Error sending friend request:', error);
        }
    });
}


