export const authHeaders = (
  token: string | null,
  headers: HeadersInit = {}
): HeadersInit => {
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
};
