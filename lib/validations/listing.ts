import { z } from 'zod';

const listingFormBaseSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  type: z.enum(['rent', 'sale', 'short_let']),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  price: z
    .number()
    .positive('Price must be greater than 0')
    .min(1000, 'Price must be at least ₦1,000')
    .max(10000000000, 'Price seems too high'),
  period: z.enum(['year', 'month', 'night']).optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  area: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  bedrooms: z.number().min(0, 'Cannot be negative').max(20, 'Maximum 20 bedrooms'),
  bathrooms: z.number().min(0, 'Cannot be negative').max(20, 'Maximum 20 bathrooms'),
  toilets: z.number().min(0, 'Cannot be negative').max(20, 'Maximum 20 toilets'),
  parking: z.number().min(0, 'Cannot be negative').max(20, 'Maximum 20 parking spaces'),
});

export const listingFormSchema = listingFormBaseSchema.superRefine((data, ctx) => {
  if (data.type === 'sale') {
    if (data.period) {
      ctx.addIssue({
        path: ['period'],
        code: z.ZodIssueCode.custom,
        message: 'Period should not be set for sale listings',
      });
    }
    return;
  }

  if (!data.period) {
    ctx.addIssue({
      path: ['period'],
      code: z.ZodIssueCode.custom,
      message: 'Period is required for rent and short-let listings',
    });
    return;
  }

  if (data.type === 'short_let' && data.period !== 'night') {
    ctx.addIssue({
      path: ['period'],
      code: z.ZodIssueCode.custom,
      message: 'Short-let listings must be per night',
    });
  }

  if (data.type === 'rent' && !['month', 'year'].includes(data.period)) {
    ctx.addIssue({
      path: ['period'],
      code: z.ZodIssueCode.custom,
      message: 'Rent listings must be per month or year',
    });
  }
});

export type ListingFormData = z.infer<typeof listingFormSchema>;

export const listingUpdateSchema = listingFormBaseSchema.partial()
export type ListingUpdateData = z.infer<typeof listingUpdateSchema>

export function validateListingUpdate(
  existing: { type: ListingFormData["type"]; period: string | null },
  update: ListingUpdateData,
) {
  const updatedType = update.type ?? existing.type
  const updatedPeriod =
    Object.prototype.hasOwnProperty.call(update, "period")
      ? update.period ?? null
      : existing.period

  if (updatedType === "sale") {
    if (updatedPeriod) {
      return "Period should not be set for sale listings"
    }
    return null
  }

  if (!updatedPeriod) {
    return "Period is required for rent and short-let listings"
  }

  if (updatedType === "short_let" && updatedPeriod !== "night") {
    return "Short-let listings must be per night"
  }

  if (updatedType === "rent" && !["month", "year"].includes(updatedPeriod)) {
    return "Rent listings must be per month or year"
  }

  return null
}

export const listingStep1Schema = listingFormBaseSchema.pick({
  title: true,
  type: true,
  description: true,
  price: true,
  period: true,
  address: true,
  area: true,
  city: true,
  state: true,
  bedrooms: true,
  bathrooms: true,
  toilets: true,
  parking: true,
});

export type ListingStep1Data = z.infer<typeof listingStep1Schema>;
