const nodemailer = require('nodemailer');

module.exports = async (username, email, link) => {
    const transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        auth: {
            user: process.env.MAIL_USER, 
            pass: process.env.MAIL_PASS 
        }
    });
    const info = await transporter.sendMail({
        from: 'no-reply@projbook.com',
        to: email,
        subject: 'Password Reset',
        text: `Hi ${username},
        \rClick on the following link ${link} to reset your password.
        \rIgnore this email if you wish to make no changes.`,                    
        html:`Hi <b>${username}</b>, 
        <p>Click on the following link <a href=${link}>${link}</a> 
        to reset your password.</p>
        <p>Ignore this email if you wish to make no changes.</p>`
    });
    return info.messageId;
};
