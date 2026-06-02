export interface ProfileResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<TData = unknown> {
  data: TData;
  message: string;
  status?: string;
  success?: boolean;
  timestamp?: string;
}
