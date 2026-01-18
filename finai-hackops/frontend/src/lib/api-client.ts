const API_URL = 'http://localhost:8000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }

  return data;
}

export const apiClient = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  put: (endpoint: string, body: any) => request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
