const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "prashantrawat2jangamer@gmail.com",
        subject: 'Welcome to the User Task App',
        text: `Welcome to the app, ${name}. Hope you find it useful.`
    })
}

const sendLeaveEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "prashantrawat2jangamer@gmail.com",
        subject: 'It was nice to have you',
        text: `Hi, ${name}. Hope you found us useful. Please share your valuable feedback about our service.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendLeaveEmail
}