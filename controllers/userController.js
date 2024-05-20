// Example userController with a simple route handler
exports.getUsers = (req, res) => {
    // Logic for retrieving users
    const users = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
    ];

    res.json(users);
};