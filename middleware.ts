// middleware.ts — replace the whole file
export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|$).*)',
  ],
}