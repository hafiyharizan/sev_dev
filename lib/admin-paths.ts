/** Admin paths reachable without a session. Everything else under /admin requires login. */
export function isPublicAdminPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname.startsWith('/admin/jemput/');
}
