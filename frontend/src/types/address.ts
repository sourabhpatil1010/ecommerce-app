export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  pincode: string;
  locality: string;
  address_line: string;
  city: string;
  state: string;
  landmark?: string;
  alternate_phone?: string;
  address_type: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressCreate {
  full_name: string;
  phone: string;
  pincode: string;
  locality: string;
  address_line: string;
  city: string;
  state: string;
  landmark?: string;
  alternate_phone?: string;
  address_type: string;
  is_default: boolean;
}

export interface AddressUpdate extends Partial<AddressCreate> {}
