import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const path = request.nextUrl.pathname
    // Public paths: skip auth entirely for faster response
    if (path === '/' || path.startsWith('/urunler') || path.startsWith('/api')) {
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect routes - redirect to login if unauthenticated user tries to access restricted areas
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/register') &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        const path = request.nextUrl.pathname
        if (path !== '/' && !path.startsWith('/urunler')) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    // Authenticated user on login/register → onboarding or feed
    if (
        user &&
        (request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/register'))
    ) {
        const url = request.nextUrl.clone()
        url.pathname = user.user_metadata?.onboarding_done ? '/feed' : '/onboarding'
        return NextResponse.redirect(url)
    }

    // Authenticated user on /feed without onboarding done → onboarding
    if (user && request.nextUrl.pathname === '/feed' && !user.user_metadata?.onboarding_done) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
