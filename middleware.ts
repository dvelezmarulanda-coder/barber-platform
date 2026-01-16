import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if needed
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // EMERGENCY FIX: Handle Supabase redirecting to root instead of callback
    // If we are at root '/'...
    if (req.nextUrl.pathname === '/') {
        // Case 1: Success code -> send to callback handler
        if (req.nextUrl.searchParams.has('code')) {
            const url = req.nextUrl.clone()
            url.pathname = '/auth/callback'
            return NextResponse.redirect(url)
        }
    }

    // Protected routes
    if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    // Auth routes (redirect to dashboard if already logged in)
    if (req.nextUrl.pathname === '/login') {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }

    return res
}

export const config = {
    // CRITICAL: Added '/' to matcher so middleware runs on root
    matcher: ['/', '/dashboard/:path*', '/login', '/admin/:path*'],
}
