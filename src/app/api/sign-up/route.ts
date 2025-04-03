import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
// import nodemailer from 'nodemailer'


export async function POST(request: Request) {
    await dbConnect();


    const salt = 10;


    try {
        const { username, email, password } = await request.json();

        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUserByUsername) {
            return Response.json(
                {
                    success: false,  //false;- now you can not do registration boz you have already registration in DB 
                    message: 'Username is already taken',
                },
                { status: 400 }
            );
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: 'User already exists with this email',
                    },
                    { status: 400 }
                );
            } else {
                // const salt=10;
                // const hashedPassword = await bcrypt.hash(password, salt);
                const hashedPassword = password;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);  // 1hr=3600Sec or 3600000miliSec
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, salt);
            const expiryDate = new Date();  //verify code expiry for 1 hour
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });

            await newUser.save();
        }



        // Send verification email
        // const emailResponse = await sendVerificationEmail(
        //     email,
        //     username,
        //     verifyCode
        // );
        // if (!emailResponse.success) { //if success not getting
        //     return Response.json(
        //         {
        //             success: false,
        //             message: emailResponse.message,
        //         },
        //         { status: 500 }
        //     );
        // }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );
        // console.log(emailResponse)
        if (!emailResponse.success) { //if success not getting
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message,
                },
                { status: 500 }
            );
        }


        return Response.json(
            {
                success: true,
                message: 'User registered successfully. Please verify your account.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error registering user:', error);
        return Response.json(
            {
                success: false,
                message: 'Error registering user',
            },
            { status: 500 }
        );
    }
}