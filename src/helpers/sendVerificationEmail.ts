// import { resend } from "@/lib/resend";
// import VerificationEmail from "../emails/VerificationEmail";
// import { ApiResponse } from '@/types/ApiResponse';

// export async function sendVerificationEmail(
//     email: string,
//     username: string,
//     verifyCode: string    // OR OTP
// ): Promise<ApiResponse> {
//     try {
//         await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: email,
//             subject: 'Enigma Message Verification Code',
//             react: VerificationEmail({ username, otp: verifyCode }),
//         });
//         return { success: true, message: 'Verification email sent successfully.' };
//     } catch (emailError) {
//         console.error('Error sending verification email:', emailError);
//         return { success: false, message: 'Failed to send verification email.' };
//     }
// }

import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/ApiResponse';
// import VerificationEmail from "../emails/VerificationEmail";


export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string    // OR OTP
): Promise<ApiResponse> {
    try {
        // Create the transporter
        var transporter = await nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        // Define the email options
        var mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: 'Enigma Message Verification Code',
            html:
                `<p><b><h2>Hello ${username},</h2></b><br /> Thank you for registering. Please use the following verification
            code to complete your registration: <br /> <br /> <br />${verifyCode} <br /> <br /> <br /> If you did 
            not request this code, please ignore this email. </p>`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Return success response
        return { success: true, message: 'Verification email sent successfully.' };
    } catch (emailError) {
        // Log the error and return failure response
        console.error('Error sending verification email:', emailError);
        return { success: false, message: 'Failed to send verification email.' };
    }
}
