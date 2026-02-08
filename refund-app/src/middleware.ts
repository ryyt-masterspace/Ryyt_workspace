import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Allow Next.js internals and static assets to pass through
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next()
    }

    // Return 503 Service Unavailable with maintenance page
    return new NextResponse(
        `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ryyt - Under Maintenance</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f7f7f7;
          color: #333;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.2rem;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>Ryyt is currently under maintenance</h1>
      <p>We are making some improvements. Please check back later.</p>
    </body>
    </html>
    `,
        { status: 503, headers: { 'content-type': 'text/html' } }
    )
}

export const config = {
    matcher: '/:path*',
}
