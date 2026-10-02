'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  listingUpdateSchema,
  validateListingUpdate,
} from "@/lib/validations/listing"
import { isValidStatusTransition, type PropertyStatus } from '@/lib/listings/status';

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a property' };
  }

  // First verify ownership
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', propertyId)
    .single();

  if (!property) {
    return { error: 'Property not found' };
  }

  if (property.owner_id !== user.id) {
    return { error: 'You do not have permission to delete this property' };
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) {
    console.error('Delete error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/listings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update a property' };
  }

  const { data: existingProperty, error: fetchError } = await supabase
    .from('properties')
    .select('status, owner_id')
    .eq('id', propertyId)
    .single();

  if (fetchError || !existingProperty) {
    return { error: 'Property not found' };
  }

  if (existingProperty.owner_id !== user.id) {
    return { error: 'You do not have permission to update this property' };
  }

  if (!isValidStatusTransition(existingProperty.status, status)) {
    return { error: 'Invalid status transition' };
  }

  const { data: updatedProperties, error } = await supabase
    .from("properties")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .select("id")

  if (error) {
    console.error('Update status error:', error);
    return { error: error.message };
  }

  if (!updatedProperties || updatedProperties.length === 0) {
    return { error: "Property not found or unauthorized" }
  }

  revalidatePath('/dashboard/listings');
  revalidatePath('/search');
  return { success: true };
}

export async function updateProperty(
  propertyId: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    type?: 'rent' | 'sale' | 'short_let';
    period?: string;
    address?: string;
    area?: string;
    city?: string;
    state?: string;
    bedrooms?: number;
    bathrooms?: number;
    toilets?: number;
    parking?: number;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update a property' };
  }

  const { data: existingProperty, error: fetchError } = await supabase
    .from("properties")
    .select("owner_id, type, period")
    .eq("id", propertyId)
    .single()

  if (fetchError || !existingProperty) {
    return { error: "Property not found" }
  }

  if (existingProperty.owner_id !== user.id) {
    return { error: "You do not have permission to update this property" }
  }

  const parsed = listingUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid listing data' };
  }

  const updateError = validateListingUpdate(
    { type: existingProperty.type, period: existingProperty.period },
    parsed.data,
  )
  if (updateError) {
    return { error: updateError }
  }

  const { data: updatedProperties, error } = await supabase
    .from("properties")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .select("id")

  if (error) {
    console.error('Update error:', error);
    return { error: error.message };
  }

  if (!updatedProperties || updatedProperties.length === 0) {
    return { error: "Property not found or unauthorized" }
  }

  revalidatePath('/dashboard/listings');
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}
