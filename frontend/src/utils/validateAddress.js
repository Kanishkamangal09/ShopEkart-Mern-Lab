// Same rules as the backend. Returns { field: 'error message' } (empty object = valid).
export function validateAddress(address) {
  const errors = {};

  // trim() makes whitespace-only values count as empty
  if (!address.fullName.trim()) errors.fullName = 'Full name is required';

  if (!address.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) errors.phone = 'Enter a valid 10-digit mobile number';

  if (!address.addressLine1.trim()) errors.addressLine1 = 'Address is required';
  if (!address.city.trim()) errors.city = 'City is required';
  if (!address.state.trim()) errors.state = 'State is required';

  if (!address.pincode.trim()) errors.pincode = 'Pincode is required';
  else if (!/^\d{6}$/.test(address.pincode.trim())) errors.pincode = 'Pincode must contain 6 digits.';

  return errors;
}
