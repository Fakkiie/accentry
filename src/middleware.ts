import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const needsAuth =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/practice') ||
    pathname.startsWith('/upgrade');

  if (!needsAuth) return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('signin', '1');
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/practice/:path*', '/upgrade/:path*']
};
