import config from "config";
import Joi from "joi";
const fs = require("fs");
import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";
import cloudinary from "cloudinary";

cloudinary.config({
    cloud_name: config.get("cloudinary.cloud_name"),
    api_key: config.get("cloudinary.api_key"),
    api_secret: config.get("cloudinary.api_secret"),
});

import qrcode from "qrcode";


module.exports = {
    generateRandomString() {
        const uppercaseLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random uppercase letter
        const randomNumbers = Math.floor(100 + Math.random() * 900); // Random three-digit number
    
        const characters = 'abcdefghijklmnopqrstuvwxyz'; // Characters to fill the rest of the string
        let randomString = '';
    
        // Generate a random string of 5 characters
        for (let i = 0; i < 9; i++) {
          randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    
        return `${uppercaseLetter}${randomString}@${randomNumbers}`;
      },

    getOTP() {
        var otp = Math.floor(100000 + Math.random() * 900000);
        return otp;
    },
    generateTempPassword() {
        return Math.random().toString(36).slice(2, 10);
    },

    getToken: async (payload) => {
        var token = await jwt.sign(payload, config.get("jwtsecret"), {
            expiresIn: "24h",
        });
        return token;
    },

    getImageUrl: async (files) => {
        try {
          var result = await cloudinary.v2.uploader.upload(files[0].path, { resource_type: "auto" });
          return result.secure_url;
        } catch (error) {
          console.log(error)
        }
      },

    genBase64: async (data) => {
        return await qrcode.toDataURL(data);
    },

    getSecureUrl: async (base64) => {
        var result = await cloudinary.v2.uploader.upload(base64);
        return result.secure_url;
    },


    sendMailContactus: async (adminEmail, adminName , userName, userEmail, userMobileNumber, msg) => {
        let html =
            `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Query Notification</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 600px;
            margin: 30px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        header {
            text-align: center;
            padding: 20px 0;
        }

        header img {
            max-width: 260px;
            height: auto;
        }

        h1 {
            font-size: 22px;
            color: #2B6AB6;
            text-align: center;
        }

        p {
            font-size: 14px;
            line-height: 1.6;
            margin: 10px 0;
        }

        .message-block {
            background-color: #f9f9f9;
            border-left: 4px solid #2B6AB6;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
            color: #555;
        }

        .details {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }

        .details p {
            margin: 5px 0;
        }

        footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }

        footer a {
            color: #2B6AB6;
            text-decoration: none;
        }

        @media only screen and (max-width: 600px) {
            .container {
                margin: 15px;
                padding: 15px;
            }

            h1 {
                font-size: 20px;
            }

            p {
                font-size: 13px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <header>
             <img src="https://res.cloudinary.com/dnbt2zgcr/image/upload/v1732601714/zxibsqaxofe4qaosc9yq.png" alt="Mobiloitte Logo">
        </header>
        <h1>New User Query Notification</h1>
        <p><b>Dear ${adminName},</b></p>
        <p>We have received a new inquiry from <b>${userName}</b>. Below are the details of their query:</p>

        <div class="message-block">
            <p>"${msg}"</p>
        </div>

        <div class="details">
            <p><b>User Details:</b></p>
            <p><b>Email:</b> ${userEmail}</p>
            <p><b>Mobile Number:</b> ${userMobileNumber}</p>
        </div>

        <p>Please respond promptly to address the user's concerns.</p>
        <p>Best regards,</p>
        <p><b>Mobiloitte Team</b></p>

       <footer>
            <small>Mobiloitte Technologies © 2024. All Rights Reserved.</small>
        </footer>
    </div>
</body>
</html>

`

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: adminEmail,
            subject: `User Query`,
            html: html,
        };
        return await transporter.sendMail(mailOptions);
    },



    sendMailContactusUser: async (to, name,msg) => {
        let html =
            `<!DOCTYPE html>
<html xmlns:color="http://www.w3.org/1999/xhtml">
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>User Query Acknowledgement - Reeltor</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
        body {
            margin: 0;
            text-align: center;
            font-family: 'Karla', sans-serif;
            color: #092147;
            background-color: #eaf0f8;
            margin-top: 2rem;
        }

        .container {
            width: 100%;
            max-width: 624px;
            display: inline-block;
            border: 1px solid #f6f9fd;
            background-color: #f6f9fd;
            margin: 0 auto;
            text-align: center;
        }

        .header {
            background: url('https://res.cloudinary.com/dnbt2zgcr/image/upload/v1737993975/iusm4qmugvmfpziozyc7.png') no-repeat center center;
            background-size: cover;
            padding-top: 150px;
            text-align: center;
        }

        .content {
            background-color: #ffffff;
            padding: 40px 48px;
            text-align: left;
        }

        .footer {
            margin-top: 58px;
            font-size: 16px;
            color: #092147;
            line-height: 1.5;
        }

        .footer small {
            color: #09214799;
            font-size: 10px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div></div>
    </div>

    <div class="content">
        <h1>Thank You for Your Query - Reeltor</h1>
        <p><b>Dear <span id="userName">${name},</span></b></p>
        <p>We have successfully received your query and our team is reviewing your message. You will hear from us soon.</p>

        <p><b>Your Query:</b></p>
        <blockquote style="margin: 20px 0; padding: 15px; background-color: #f6f9fd; border-left: 4px solid #092147;">
            <p>"${msg}"</p>
        </blockquote>

        <p>If you have any further information or questions, please feel free to reach out at any time. We are here to assist you.</p>

        <p>Best regards,</p>

        <p>The Reeltor Team</p>
    </div>

    <div class="footer">
        <small>© 2024 Reeltor. All rights reserved.</small>
    </div>
</div>
</body>
</html>
`

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: `Query`,
            html: html,
        };
        return await transporter.sendMail(mailOptions);
    },

    sendMailReplyFromAdmin: async (to, name, msg, question) => {
        let html =
            `<!DOCTYPE html>
<html xmlns:color="http://www.w3.org/1999/xhtml">
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Admin Response - Reeltor</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
        body {
            margin: 0;
            text-align: center;
            font-family: 'Karla', sans-serif;
            color: #092147;
            background-color: #eaf0f8;
            margin-top: 2rem;
        }

        .container {
            width: 100%;
            max-width: 624px;
            display: inline-block;
            border: 1px solid #f6f9fd;
            background-color: #f6f9fd;
            margin: 0 auto;
            text-align: center;
        }

        .header {
            background: url('https://res.cloudinary.com/dnbt2zgcr/image/upload/v1737993975/iusm4qmugvmfpziozyc7.png') no-repeat center center;
            background-size: cover;
            padding-top: 150px;
            text-align: center;
        }

        .content {
            background-color: #ffffff;
            padding: 40px 48px;
            text-align: left;
        }

        .footer {
            margin-top: 58px;
            font-size: 16px;
            color: #092147;
            line-height: 1.5;
        }

        .footer small {
            color: #09214799;
            font-size: 10px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div></div>
    </div>

    <div class="content">
        <h1>Response to Your Query - Reeltor</h1>
        <p><b>Dear <span id="userName">${name},</span></b></p>
        <p>We are writing to inform you that your query has been addressed. Below is the response from our support team:</p>

        <p><b>Your Query:</b></p>
        <blockquote style="margin: 20px 0; padding: 15px; background-color: #f6f9fd; border-left: 4px solid #092147;">
            <p>"${question}"</p>
        </blockquote>

        <p><b>Admin Response:</b></p>
        <blockquote style="margin: 20px 0; padding: 15px; background-color: #f6f9fd; border-left: 4px solid #092147;">
            <p>${msg}</p>
        </blockquote>

        <p>We hope this resolves your query. If you have any further questions or need additional assistance, please don't hesitate to reach out.</p>

        <p>Best regards,</p>

        <p>The Reeltor Team</p>
    </div>

    <div class="footer">
        <small>© 2024 Reeltor. All rights reserved.</small>
    </div>
</div>
</body>
</html>
`

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: "<do_not_reply@gmail.com>",
            to: to,
            subject: `Query Reply`,
            html: html,
        };
        return await transporter.sendMail(mailOptions);
    },

        sendEmailOtp: async (email, otp) => {
            let html =`<!DOCTYPE html>
<html xmlns:color="http://www.w3.org/1999/xhtml">
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>OTP Verification - Reeltor</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
        body {
            margin: 0;
            text-align: center;
            font-family: 'Karla', sans-serif;
            color: #092147;
            background-color: #eaf0f8;
            margin-top: 2rem;
        }

        .container {
            width: 100%;
            max-width: 624px;
            display: inline-block;
            border: 1px solid #f6f9fd;
            background-color: #f6f9fd;
            margin: 0 auto;
            text-align: center;
        }

        .header {
            background: url('https://res.cloudinary.com/dnbt2zgcr/image/upload/v1737993975/iusm4qmugvmfpziozyc7.png') no-repeat center center;
            background-size: cover;
            height: 150px; /* Adjust height as needed */
            text-align: center;
        }

        .content {
            background-color: #ffffff;
            padding: 40px 48px;
            text-align: left;
        }

        .otp-block {
            display: inline-block;
            margin-top: 40px;
            width: 85%;
        }

        .footer {
            margin-top: 58px;
            font-size: 16px;
            color: #092147;
            line-height: 1.5;
        }

        .footer small {
            color: #09214799;
            font-size: 10px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header"></div>

    <div class="content">
        <h1>OTP Verification - Reeltor</h1>
        <div class="otp-block">
            <p><b>Hi ,</b></p>
            <p>Thank you for signing up with Reeltor. To ensure the security of your account, please verify your email address.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <p style="font-size: 24px; font-weight: bold;">${otp}</p>
            <p>This OTP is valid for the next 3 minutes. If you did not request this verification, kindly disregard this email.</p>
            <p>Should you have any questions or need further assistance, please feel free to contact our support team.</p>
        </div>

        <p>Best regards,</p>
        <p><b>The Reeltor Team</b></p>
    </div>

    <div class="footer">
        <small>© 2024 Reeltor. All rights reserved.</small>
    </div>
</div>
</body>
</html>
`
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // use SSL
                service: config.get("nodemailer.service"),
                auth: {
                    user: config.get("nodemailer.email"),
                    pass: config.get("nodemailer.password"),
                },
            });
            var mailOptions = {
                from: config.get("nodemailer.email"),
                to: email,
                subject: "Otp for verification",
                html: html,
            };
            return await transporter.sendMail(mailOptions);

        },


    sendEmailForgotPassOtp: async (email, otp) => {
        let html =
            `<!DOCTYPE html>
<html xmlns:color="http://www.w3.org/1999/xhtml">
<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>OTP Verification - Reeltor</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
        body {
            margin: 0;
            text-align: center;
            font-family: 'Karla', sans-serif;
            color: #092147;
            background-color: #eaf0f8;
            margin-top: 2rem;
        }

        .container {
            width: 100%;
            max-width: 624px;
            display: inline-block;
            border: 1px solid #f6f9fd;
            background-color: #f6f9fd;
            margin: 0 auto;
            text-align: center;
        }

        .header {
            background: url('https://res.cloudinary.com/dnbt2zgcr/image/upload/v1737993975/iusm4qmugvmfpziozyc7.png') no-repeat center center;
            background-size: cover;
            height: 150px; /* Adjust height as needed */
            text-align: center;
        }

        .content {
            background-color: #ffffff;
            padding: 40px 48px;
            text-align: left;
        }

        .otp-block {
            display: inline-block;
            margin-top: 40px;
            width: 85%;
        }

        .footer {
            margin-top: 58px;
            font-size: 16px;
            color: #092147;
            line-height: 1.5;
        }

        .footer small {
            color: #09214799;
            font-size: 10px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header"></div>

    <div class="content">
        <h1>OTP Verification - Reeltor</h1>
        <div class="otp-block">
            <p><b>Hi ,</b></p>
            <p>Thank you for signing up with Reeltor. To ensure the security of your account, please verify your email address.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <p style="font-size: 24px; font-weight: bold;">${otp}</p>
            <p>This OTP is valid for the next 3 minutes. If you did not request this verification, kindly disregard this email.</p>
            <p>Should you have any questions or need further assistance, please feel free to contact our support team.</p>
        </div>

        <p>Best regards,</p>
        <p><b>The Reeltor Team</b></p>
    </div>

    <div class="footer">
        <small>© 2024 Reeltor. All rights reserved.</small>
    </div>
</div>
</body>
</html>
`
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: config.get("nodemailer.email"),
            to: email,
            subject: "Otp for reset password",
            html: html,
        };
        return await transporter.sendMail(mailOptions);

    },

    sendEmailInvite: async (email, password) => {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Mobiloitte Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }

        .main-container {
            max-width: 600px;
            margin: 30px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        header {
            text-align: center;
            padding: 20px 0;
        }

        header img {
            max-width: 270px;
            height: auto;
        }

        h2 {
            font-size: 22px;
            margin-bottom: 10px;
            color: #2B6AB6;
            text-align: center;
        }

        p {
            font-size: 14px;
            line-height: 1.6;
            margin: 10px 0;
        }

        .credentials {
            background-color: #f8f9fa;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin: 15px 0;
        }

        .credentials p {
            margin: 5px 0;
        }

        footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }

        footer a {
            color: #2B6AB6;
            text-decoration: none;
        }

        @media only screen and (max-width: 600px) {
            .main-container {
                margin: 15px;
                padding: 15px;
            }

            h2 {
                font-size: 20px;
            }

            p {
                font-size: 13px;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <header>
            <img src="https://res.cloudinary.com/dnbt2zgcr/image/upload/v1732601714/zxibsqaxofe4qaosc9yq.png" alt="Mobiloitte Logo">
        </header>
        <h2>Welcome to Your New Role as a Sub Admin!</h2>
        <p>Dear <b>User</b>,</p>
        <p>We are pleased to inform you that you have been appointed as a <b>Sub Admin</b> on the Mobiloitte platform. As part of your new role, you will have access to various administrative features based on your assigned permissions.</p>
        <p>Please use the following credentials to log in to the Admin Panel:</p>
        <div class="credentials">
            <p><strong>Username:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p>We recommend changing your password after your first login for enhanced security.</p>
        <p>If you have any questions or require assistance, feel free to contact our support team at any time.</p>
        <p>Best regards,</p>
        <p><b>Team Mobiloitte</b></p>
        <footer>
            <small>Mobiloitte Technologies © 2024. All Rights Reserved.</small>
        </footer>
    </div>
</body>
</html>

    `
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: config.get("nodemailer.email"),
            to: email,
            subject: "You get a New Role - SubAdmin!",
            html: html,
        };
        return await transporter.sendMail(mailOptions);

    },
    sendMeetingLink: async (toEmail, ccEmails , inviteLink , calendarLink , startDateTime ) => {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Mobiloitte Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .main-container {
            max-width: 600px;
            margin: 30px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        header {
            text-align: center;
            padding: 20px 0;
        }
        header img {
            max-width: 270px;
            height: auto;
        }
        h2 {
            font-size: 22px;
            margin-bottom: 10px;
            color: #2B6AB6;
            text-align: center;
        }

        p {
            font-size: 14px;
            line-height: 1.6;
            margin: 10px 0;
        }

        .credentials {
            background-color: #f8f9fa;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin: 15px 0;
        }

        .credentials p {
            margin: 5px 0;
        }

        footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }

        footer a {
            color: #2B6AB6;
            text-decoration: none;
        }

        @media only screen and (max-width: 600px) {
            .main-container {
                margin: 15px;
                padding: 15px;
            }

            h2 {
                font-size: 20px;
            }

            p {
                font-size: 13px;
            }
        }
    </style>
</head>

<body>
    <div class="main-container">
        <header>
            <img src="https://res.cloudinary.com/dnbt2zgcr/image/upload/v1732601714/zxibsqaxofe4qaosc9yq.png" alt="Mobiloitte Logo">
        </header>
        <h2>New Meeting Scheduled!</h2>
        <p><b>Hi,</b></p>
        <p>We want to inform you that a meeting is scheduled  </p>
        <p>Please check following details of the meeting:</p>
        <div class="credentials">
            <p><strong>Join Link:</strong> ${inviteLink}</p>
            <p><strong>Calendar Link:</strong> ${calendarLink}</p>
            <p><strong>Start Time:</strong> ${startDateTime}</p>
        </div>
    
        <p>If you have any questions or require assistance, feel free to contact our support team at any time.</p>
        <p>Best regards,</p>
        <p><b>Team Mobiloitte</b></p>
        <footer>
            <small>Mobiloitte Technologies © 2024. All Rights Reserved.</small>
        </footer>
    </div>
</body>
</html>
    `
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            service: config.get("nodemailer.service"),
            auth: {
                user: config.get("nodemailer.email"),
                pass: config.get("nodemailer.password"),
            },
        });
        var mailOptions = {
            from: config.get("nodemailer.email"),
            to: toEmail,
            cc: ccEmails.join(','),
            subject: "New Meeting Scheduled",
            html: html,
        };
        return await transporter.sendMail(mailOptions);

    },
    

    uploadImage(image) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(image, function (error, result) {
                console.log(result);
                if (error) {
                    reject(error);
                } else {
                    resolve(result.url);
                }
            });
        })
    }

}