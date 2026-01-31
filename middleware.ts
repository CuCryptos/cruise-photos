export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/sessions/:path*', '/upload/:path*', '/orders/:path*'],
};
