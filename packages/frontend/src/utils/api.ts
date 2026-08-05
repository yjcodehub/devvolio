/**
 * Dynamically resolves the API URL based on the current environment.
 * If running in the browser, it adapts to local subdomains (.lvh.me / .localhost)
 * so that API calls reliably hit the backend server at http://localhost:5000/api/v1.
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.lvh.me') ||
      hostname.endsWith('.localhost') ||
      hostname.startsWith('192.168.')
    ) {
      return 'http://localhost:5000/api/v1';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
}
