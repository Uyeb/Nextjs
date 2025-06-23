import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Bỏ qua API routes để tránh chặn login hoặc API khác
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  
  if (!token && pathname !== '/sign-in') {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (token && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Chỉ áp dụng cho pages — bỏ qua API và static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};