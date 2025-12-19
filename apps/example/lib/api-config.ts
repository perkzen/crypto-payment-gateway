import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';

export function createApiClient(apiKey?: string) {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'x-api-key': apiKey }),
    },
  });
}
