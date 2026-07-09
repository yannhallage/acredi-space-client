import type {
  ApiResponse,
  CreateProfileRequest,
  ProfileResponse,
  UpdateProfileRequest,
} from './types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function getAuthToken() {
  const session = localStorage.getItem('acredi-session');

  if (!session) {
    return null;
  }

  try {
    const parsed = JSON.parse(session);

    return (
      parsed.accessToken ??
      parsed.token ??
      parsed.tokens?.accessToken ??
      parsed.auth?.accessToken ??
      null
    );
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new Error(body?.message ?? 'Erreur serveur');
  }

  return body?.data as T;
}

export const profileService = {
  findAll() {
    return request<ProfileResponse[]>('/api/profiles');
  },

  create(payload: CreateProfileRequest) {
    return request<ProfileResponse>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateProfileRequest) {
    return request<ProfileResponse>(`/api/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  delete(id: string) {
    return request<void>(`/api/profiles/${id}`, {
      method: 'DELETE',
    });
  },
};