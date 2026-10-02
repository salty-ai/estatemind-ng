import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup');

  if (isProtectedRoute && !user) {
    // Redirect to login if trying to access protected route without auth
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // Redirect to dashboard if already logged in
    const url = request.nextUrl.clone();
    const redirectPath = request.nextUrl.searchParams.get('redirect');
    const safeRedirect =
      redirectPath && redirectPath.startsWith('/') ? redirectPath : null;
    url.pathname = safeRedirect ?? '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
