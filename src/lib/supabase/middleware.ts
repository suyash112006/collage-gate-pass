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

    if (isTgRoute && role !== 'tg') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'student' ? '/student/dashboard' : '/tg/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'tg' ? '/tg/dashboard' : '/student/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

