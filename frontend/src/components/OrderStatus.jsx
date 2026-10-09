const STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const LABELS = {
  PENDING_PAYMENT: 'Payment pending',
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

// small coloured label, e.g. [ Shipped ]
export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{LABELS[status] || status}</span>;
}

// progress bar: Placed -> Confirmed -> Shipped -> Delivered
export default function OrderTracker({ status }) {
  const current = STEPS.indexOf(status);

  if (current === -1) {
    return <StatusBadge status={status} />;
  }

  return (
    <ol className="tracker">
      {STEPS.map((step, index) => (
        <li key={step} className={index <= current ? 'is-done' : ''}>
          <span className="tracker-dot" />
          {LABELS[step]}
        </li>
      ))}
    </ol>
  );
}
