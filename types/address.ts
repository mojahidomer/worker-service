export interface AddressFormState {
  line1: string;
  line2?: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}
