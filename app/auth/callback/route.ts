import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

        try {
            // Exchange code for session
            await supabase.auth.exchangeCodeForSession(code)

            // Get user profile to determine role
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('perfiles')
                    .select('rol')
                    .eq('id', user.id)
                    .single()

                // Redirect based on role
                // Updated: Admins go to main panel /admin, not QR
                const redirectUrl = profile?.rol === 'admin'
                    ? new URL('/admin', requestUrl.origin)
                    : new URL('/dashboard', requestUrl.origin)

                return NextResponse.redirect(redirectUrl)
            }
        } catch (error) {
            console.error('Error in auth callback:', error)
        }
    }

    // Fallback: redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin))
}
