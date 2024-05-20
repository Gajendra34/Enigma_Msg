import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {

    // if (request.method !== "GET") {
    //     return Response.json(
    //         {
    //             success: false,
    //             message: 'Method Not Allowed',
    //         },
    //         { status: 405 }
    //     )
    // }

    await dbConnect();

    try {
        // url like => localhost:3000/api/check-username-unique?username=ravi34?phone=android...........
        // we check username from url in query(username in query)
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username'),
        };

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(', ')
                            : 'Invalid query parameters',
                },
                { status: 400 }
            );
        }

        // console.log(result)
        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Username is unique',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking username:', error);
        return Response.json(
            {
                success: false,
                message: 'Error checking username',
            },
            { status: 500 }
        );
    }
}
