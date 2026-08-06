export type ProfileResponse = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProfileRequest = {
  name: string;
  description?: string | null;
};

export type UpdateProfileRequest = {
  name: string;
  description?: string | null;
};

export type ApiResponse<T> = {
  success?: boolean;
  message: string;
  data: T;
};