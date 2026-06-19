import { NextResponse } from 'next/server';

/**
 * Middleware Global para CORS
 * 
 * Este middleware intercepta todas las peticiones a /api/* y añade
 * las cabeceras CORS necesarias para autorizar peticiones desde
 * https://pepitogumball-lang.github.io (Shadow Engine).
 * 
 * También maneja las peticiones de pre-vuelo (OPTIONS) requeridas
 * por los navegadores modernos antes de realizar peticiones reales.
 */

const ALLOWED_ORIGIN = 'https://pepitogumball-lang.github.io';

export function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // Solo aplicar CORS a rutas de API
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Obtener el origen de la petición
  const requestOrigin = request.headers.get('origin');

  // Crear la respuesta base
  let response = NextResponse.next();

  // Aplicar cabeceras CORS si el origen es permitido
  if (requestOrigin === ALLOWED_ORIGIN) {
    response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 horas
  }

  // Manejar peticiones de pre-vuelo (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': requestOrigin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : '',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
