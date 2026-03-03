const { createClient, REDISEARCH_LANGUAGE } = require('redis');
const nodemailer = require('nodemailer');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

async function sendVerificationCode(email){
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`verify:${email}`, code , {EX: 600});//код удалится сам через 10 минут

    const mailOptions = {
        from: `"My Game" <${process.env.EMAIL_USER}`,
        to: email,
        subject: 'Your Verification Code',
        text: `Your code is: ${code}`,
        html: `<h1>Code: ${code}</h1>`
    };
    await transporter.sendMail(mailOptions);
    return true;
}
module.exports = { sendVerificationCode };