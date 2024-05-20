'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode; // type defiend
}) {
    return (
        <SessionProvider>
            {children} 
        </SessionProvider>
    );
}