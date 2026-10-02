export type PropertyStatus = 'draft' | 'pending' | 'active' | 'sold' | 'leased';

const validStatusTransitions: Record<PropertyStatus, PropertyStatus[]> = {
  draft: ['draft', 'pending'],
  pending: ['pending', 'active', 'draft'],
  active: ['active', 'sold', 'leased', 'draft'],
  sold: [],
  leased: [],
};

export function isValidStatusTransition(
  fromStatus: PropertyStatus,
  toStatus: PropertyStatus
) {
  return validStatusTransitions[fromStatus].includes(toStatus);
}
