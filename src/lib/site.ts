export const SITE_NAME = 'Copa de Futsal Feminino Vila Mariana 2026';
export const SITE_DESCRIPTION =
  'Acompanhe times, jogos, classificação e estatísticas da Copa de Futsal Feminino Vila Mariana 2026.';
export const SITE_TIME_ZONE = 'America/Sao_Paulo';

const configuredBase = import.meta.env.BASE_URL;

export const BASE_PATH = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;

export function withBase(path = '/'): string {
  return `${BASE_PATH}${path.replace(/^\/+/, '')}`;
}

export type NavKey = 'inicio' | 'jogos' | 'classificacao' | 'times' | 'estatisticas' | 'fase-final';

export interface NavItem {
  readonly key: NavKey;
  readonly label: string;
  readonly href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'inicio', label: 'Início', href: withBase('/') },
  { key: 'jogos', label: 'Jogos', href: withBase('/jogos/') },
  { key: 'classificacao', label: 'Classificação', href: withBase('/classificacao/') },
  { key: 'times', label: 'Times', href: withBase('/times/') },
  { key: 'estatisticas', label: 'Estatísticas', href: withBase('/estatisticas/') },
  { key: 'fase-final', label: 'Fase final', href: withBase('/fase-final/') },
];

export function getBuildDate(now: Date = new Date()): Date {
  const epoch = process.env.SOURCE_DATE_EPOCH;

  if (epoch !== undefined && epoch.trim() !== '') {
    const seconds = Number(epoch);
    if (Number.isInteger(seconds) && seconds >= 0) {
      return new Date(seconds * 1000);
    }
  }

  return now;
}

export function formatBuildTimestamp(date: Date): string {
  const day = new Intl.DateTimeFormat('pt-BR', {
    timeZone: SITE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const time = new Intl.DateTimeFormat('pt-BR', {
    timeZone: SITE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);

  return `${day} às ${time}`;
}
