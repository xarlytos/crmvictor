import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '@/config/dataProvider';
import type { Cliente } from '@/types';

export function useClientes() {
  return useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { items } = await dataProvider.listClientes();
      return items;
    },
  });
}
