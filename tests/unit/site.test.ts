import { afterEach, describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS, SITE_NAME, formatBuildTimestamp, getBuildDate } from '../../src/lib/site';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('configuração do site', () => {
  it('usa o nome público definido no PRD', () => {
    expect(SITE_NAME).toBe('Copa de Futsal Feminino Vila Mariana 2026');
  });

  it('tem os seis links de navegação, sem Regulamento', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      'Início',
      'Jogos',
      'Classificação',
      'Times',
      'Estatísticas',
      'Fase final',
    ]);

    expect(
      NAV_ITEMS.some(
        (item) => /regulamento/i.test(item.label) || /regulamento/i.test(item.href),
      ),
    ).toBe(false);
  });

  it('formata o instante do build no fuso de Brasília', () => {
    expect(formatBuildTimestamp(new Date('2026-11-14T01:30:00Z'))).toBe('13/11/2026 às 22:30');
  });

  it('usa SOURCE_DATE_EPOCH quando definido', () => {
    vi.stubEnv('SOURCE_DATE_EPOCH', '0');
    expect(getBuildDate(new Date('2026-11-13T12:00:00Z')).toISOString()).toBe(
      '1970-01-01T00:00:00.000Z',
    );
  });

  it('ignora SOURCE_DATE_EPOCH vazio', () => {
    vi.stubEnv('SOURCE_DATE_EPOCH', '');
    const fallback = new Date('2026-11-13T12:00:00Z');
    expect(getBuildDate(fallback)).toBe(fallback);
  });
});
