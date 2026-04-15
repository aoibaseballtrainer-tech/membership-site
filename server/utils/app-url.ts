export function getFrontendUrl(path = '/'): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://membership-site-frontend.onrender.com';
  return new URL(path, `${baseUrl.replace(/\/+$/, '')}/`).toString();
}
