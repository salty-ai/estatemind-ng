import { describe, expect, it } from 'vitest';
import { isValidStatusTransition } from '@/lib/listings/status';

describe('isValidStatusTransition', () => {
  it('allows draft to pending', () => {
    expect(isValidStatusTransition('draft', 'pending')).toBe(true);
  });

  it('blocks sold to active', () => {
    expect(isValidStatusTransition('sold', 'active')).toBe(false);
  });

  it('allows active to leased', () => {
    expect(isValidStatusTransition('active', 'leased')).toBe(true);
  });
});
