// The most simple usage is when you want to require authentication for your entire site. You can add a middleware.js file with the following:

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware'; // middleware sabhi pages pe lga doooo

export const config = { // config means;- where-where our midddleware are runs
    matcher: ['/dashboard/:path*',
        '/sign-in',
        '/sign-up',
        '/',
        '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;  //where our middleware
    console.log(url);

    // Redirect to dashboard if the user is already authenticated
    // and trying to access sign-in, sign-up, or home page
    if (
        token &&
        (url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/verify') ||
            url.pathname === '/')
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}
