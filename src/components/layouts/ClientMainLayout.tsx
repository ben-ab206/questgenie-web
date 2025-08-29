"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import Sidebar from "../Sidebar";

interface ClientMainLayoutProps {
    children: React.ReactNode;
    user: {
        email?: string;
        name?: string;
        id: number;
    };
    signOutAction: () => Promise<void>;
}

export default function ClientMainLayout({ 
    children, 
    user, 
    signOutAction 
}: ClientMainLayoutProps) {
    // Create QueryClient instance only once per component lifetime
    const [queryClient] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 5 * 60 * 1000, // 5 minutes
                    refetchOnWindowFocus: false,
                    retry: 1,
                },
                mutations: {
                    retry: 1,
                },
            },
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen bg-primary/10">
                <Sidebar 
                    userEmail={user?.email} 
                    userName={user?.name} 
                    onLogout={signOutAction} 
                />
                <main className="flex-1">
                    {children}
                </main>
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}