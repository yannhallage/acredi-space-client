import { useQuery } from '@tanstack/react-query'
import { fileRows } from '../data/files.mock'

export function useFilesQuery() {
  return useQuery({
    queryKey: ['files', 'mock'],
    queryFn: async () => fileRows,
  })
}
