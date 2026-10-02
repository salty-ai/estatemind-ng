import { describe, expect, it } from 'vitest';
import { listingFormSchema } from '@/lib/validations/listing';

const baseListing = {
  title: 'Modern 2-Bed Apartment',
  type: 'rent' as const,
  description: 'Spacious apartment with great amenities and easy access.',
  price: 2500000,
  period: 'month' as const,
  address: '15 Admiralty Way',
  area: 'Lekki Phase 1',
  city: 'Lagos',
  state: 'Lagos',
  bedrooms: 2,
  bathrooms: 2,
  toilets: 2,
  parking: 1,
};

describe('listingFormSchema', () => {
  it('requires period for rent listings', () => {
    const result = listingFormSchema.safeParse({ ...baseListing, period: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects period for sale listings', () => {
    const result = listingFormSchema.safeParse({
      ...baseListing,
      type: 'sale',
      period: 'month',
    });
    expect(result.success).toBe(false);
  });

  it('requires night period for short-let listings', () => {
    const result = listingFormSchema.safeParse({
      ...baseListing,
      type: 'short_let',
      period: 'month',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid short-let listing', () => {
    const result = listingFormSchema.safeParse({
      ...baseListing,
      type: 'short_let',
      period: 'night',
    });
    expect(result.success).toBe(true);
  });
});
