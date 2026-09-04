import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  const isAuthRoute = 
    pathname === '/student/login' || 
    pathname === '/student/signup' ||
    pathname === '/student/forgot-password' ||
    pathname === '/tg/login' || 
    pathname === '/tg/signup' ||
    pathname === '/tg/forgot-password'

  const isStudentRoute = (pathname === '/student' || pathname.startsWith('/student/')) && !isAuthRoute
  const isTgRoute = (pathname === '/tg' || pathname.startsWith('/tg/')) && !isAuthRoute

  // Early exit if the route doesn't require middleware auth/role handling
  if (!isStudentRoute && !isTgRoute && !isAuthRoute) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  if (isStudentRoute || isTgRoute) {
    if (!user) {
      if (pathname === '/student/blocked') {
        return supabaseResponse
      }
      const url = request.nextUrl.clone()
      url.pathname = isStudentRoute ? '/student/login' : '/tg/login'
      return NextResponse.redirect(url)
    }

    // Role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (isStudentRoute && role !== 'student') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'tg' ? '/tg/dashboard' : '/student/login'
      return NextResponse.redirect(url)
    }

    if (isStudentRoute && role === 'student') {
      // Check student status
      const { data: student } = await supabase
        .from('students')
        .select('status')
        .eq('user_id', user.id)
        .single()

      const status = student?.status || 'UNDER_REVIEW'
      
      const isStatusRoute = 
        pathname === '/student/under-review' || 
        pathname === '/student/blocked' || 
        pathname === '/student/declined'

      if (status === 'UNDER_REVIEW' && pathname !== '/student/under-review') {
        const url = request.nextUrl.clone()
        url.pathname = '/student/under-review'
        return NextResponse.redirect(url)
      } else if (status === 'BLOCKED' && pathname !== '/student/blocked') {
        const url = request.nextUrl.clone()
        url.pathname = '/student/blocked'
        return NextResponse.redirect(url)
      } else if (status === 'DECLINED' && pathname !== '/student/declined') {
        const url = request.nextUrl.clone()
        url.pathname = '/student/declined'
        return NextResponse.redirect(url)
      } else if (status === 'APPROVED' && isStatusRoute) {
        // Redirect active students away from status pages back to dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/student/dashboard'
        return NextResponse.redirect(url)
      }
    }

    if (isTgRoute && role !== 'tg') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'student' ? '/student/dashboard' : '/tg/login'
      return NextResponse.redirect(url)
    }
  }

  // Handle authenticated users visiting auth (login/signup) routes
  if (isAuthRoute && user) {
    const isLoginRoute = pathname === '/student/login' || pathname === '/tg/login'
    
    if (isLoginRoute) {
      // If a user visits a login page while authenticated (e.g., stale session from
      // signup, or deliberately navigating to login), let them through. The login
      // page will overwrite their session when they submit credentials.
      // Do NOT redirect to /student/under-review or any status page.
      return supabaseResponse
    }

    // For signup routes, redirect authenticated users to their dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const url = request.nextUrl.clone()
    
    if (profile?.role === 'tg') {
      url.pathname = '/tg/dashboard'
    } else if (profile?.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('status')
        .eq('user_id', user.id)
        .single()
        
      const status = student?.status || 'UNDER_REVIEW'
      if (status === 'UNDER_REVIEW') url.pathname = '/student/under-review'
      else if (status === 'BLOCKED') url.pathname = '/student/blocked'
      else if (status === 'DECLINED') url.pathname = '/student/declined'
      else url.pathname = '/student/dashboard'
    } else {
      // No profile found — let them through to signup
      return supabaseResponse
    }
    
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

