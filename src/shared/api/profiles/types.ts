export interface ProfileResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProfileRequest {
  name: string;
  description?: string | null;
}

export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  status?: string;
  success?: boolean;
  timestamp?: string;
}
