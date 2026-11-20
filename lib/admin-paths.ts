/** Admin paths reachable without a session. Everything else under /admin requires login. */
export function isPublicAdminPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname.startsWith('/admin/jemput/');
}

/** Where to go after login. Only same-site /admin paths are honoured (no open redirects). */
export function safeAdminRedirect(raw: string | null | undefined): string {
  if (typeof raw !== 'string' || raw.includes('\\')) return '/admin';
  const ok = raw === '/admin' || raw.startsWith('/admin/') || raw.startsWith('/admin?');
  return ok ? raw : '/admin';
}
