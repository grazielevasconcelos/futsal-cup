import { describe, expect, it } from 'vitest';

import { formatTeamLabel } from '../../src/lib/format/team';

describe('formatTeamLabel', () => {
  it('prioriza o nome público editável', () => {
    expect(formatTeamLabel({ displayName: 'De primeira FC', name: 'Time A' })).toBe(
      'De primeira FC',
    );
  });

  it('usa o nome-base quando não há nome público', () => {
    expect(formatTeamLabel({ displayName: null, name: 'Time B' })).toBe('Time B');
  });
});
