export type UserRole = 'seeker' | 'agent' | 'admin';
export type PropertyType = 'rent' | 'sale' | 'short_let';
export type PropertyStatus = 'draft' | 'pending' | 'active' | 'sold' | 'leased';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  period: string | null;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  area: string | null;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parking: number;
  images: string[];
  video_url: string | null;
  is_verified_listing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  name: string;
}

export interface PropertyFeature {
  property_id: string;
  feature_id: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Property, 'id'>>;
      };
      features: {
        Row: Feature;
        Insert: Omit<Feature, 'id'> & { id?: string };
        Update: Partial<Omit<Feature, 'id'>>;
      };
      property_features: {
        Row: PropertyFeature;
        Insert: PropertyFeature;
        Update: Partial<PropertyFeature>;
      };
    };
    Enums: {
      user_role: UserRole;
      property_type: PropertyType;
      property_status: PropertyStatus;
    };
  };
}
