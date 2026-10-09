const fields = [
  { name: 'fullName', label: 'Full Name', placeholder: 'Aarav Sharma', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', placeholder: '9876543210', autoComplete: 'tel', maxLength: 10 },
  { name: 'addressLine1', label: 'Address', placeholder: 'House no, street, area', autoComplete: 'address-line1', wide: true },
  { name: 'city', label: 'City', placeholder: 'Bengaluru', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', placeholder: 'Karnataka', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', placeholder: '560001', autoComplete: 'postal-code', maxLength: 6 }
];

// Only shows the inputs. The values and errors live in the Checkout page.
function CheckoutForm({ address, errors, onChange, disabled }) {
  return (
    <div className="checkout-fields">
      {fields.map((field) => (
        <div
          key={field.name}
          className={`field ${field.wide ? 'field-wide' : ''} ${errors[field.name] ? 'has-error' : ''}`}
        >
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.name === 'phone' ? 'tel' : 'text'}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            maxLength={field.maxLength}
            value={address[field.name]}
            onChange={onChange}
            disabled={disabled}
          />
          {errors[field.name] && <span className="field-error">{errors[field.name]}</span>}
        </div>
      ))}
    </div>
  );
}

export default CheckoutForm;
