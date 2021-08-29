import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(value?: string): string {
  if (!value) {
    return '';
  }

  return format(parseISO(value), 'dd MMM yyyy', {
    locale: ptBR,
  });
}
