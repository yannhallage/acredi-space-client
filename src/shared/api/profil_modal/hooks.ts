import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from './profileService';
import type { CreateProfileRequest, UpdateProfileRequest } from './types';

export const profilesKeys = {
  all: ['profiles'] as const,
};

export function useProfilesQuery() {
  return useQuery({
    queryKey: profilesKeys.all,
    queryFn: profileService.findAll,
  });
}

export function useCreateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProfileRequest) =>
      profileService.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profilesKeys.all,
      });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProfileRequest;
    }) => profileService.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profilesKeys.all,
      });
    },
  });
}

export function useDeleteProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profilesKeys.all,
      });
    },
  });
}