import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatDateHeading,
  formatDateTime,
  formatTime,
  formatWeekday,
} from '../../src/lib/format/date';

describe('formatDate', () => {
  it('formata datas de calendário sem deslocar o dia', () => {
    expect(formatDate('2026-11-24')).toBe('24/11/2026');
    expect(formatDate('2026-12-03')).toBe('03/12/2026');
    expect(formatDate('2026-01-01')).toBe('01/01/2026');
  });

  it('retorna vazio para data inválida', () => {
    expect(formatDate('24/11/2026')).toBe('');
  });
});

describe('formatWeekday', () => {
  it('devolve o dia da semana por extenso', () => {
    expect(formatWeekday('2026-11-24')).toBe('terça-feira');
    expect(formatWeekday('2026-12-03')).toBe('quinta-feira');
  });
});

describe('formatDateHeading', () => {
  it('combina dia da semana e data com inicial maiúscula', () => {
    expect(formatDateHeading('2026-11-24')).toBe('Terça-feira, 24/11/2026');
    expect(formatDateHeading('2026-12-03')).toBe('Quinta-feira, 03/12/2026');
  });
});

describe('formatTime', () => {
  it('formata o horário no fuso de São Paulo', () => {
    expect(formatTime('2026-11-24T19:00:00-03:00')).toBe('19:00');
    expect(formatTime('2026-11-24T22:30:00Z')).toBe('19:30');
    expect(formatTime('2026-12-04T00:30:00Z')).toBe('21:30');
  });

  it('retorna vazio para timestamp inválido', () => {
    expect(formatTime('24/11/2026 19:00')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('junta data e hora com "às"', () => {
    expect(formatDateTime('2026-11-24T19:00:00-03:00')).toBe('24/11/2026 às 19:00');
    expect(formatDateTime('2026-12-03T20:30:00-03:00')).toBe('03/12/2026 às 20:30');
  });

  it('usa o dia local de São Paulo', () => {
    expect(formatDateTime('2026-12-04T00:30:00Z')).toBe('03/12/2026 às 21:30');
  });
});
