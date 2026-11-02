// TLS terminates at Railway before the request reaches Next's internal HTTP URL.
export function sameOrigin(origin, host, allowHttp = false) {
  if (!origin || !host) return false;
  return origin === `https://${host}` || (allowHttp && origin === `http://${host}`);
}
