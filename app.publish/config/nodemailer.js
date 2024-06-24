const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'simonfranklin80@gmail.com',
        pass: 'zkdh opbv ljpm koof'
    }
});

module.exports = transporter;
