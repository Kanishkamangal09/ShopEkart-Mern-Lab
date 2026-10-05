import { useState } from 'react';
import { addToWishlist, removeFromWishlist } from '../services/api';

// One button that adds or removes (toggle), depending on "saved".
// The parent page owns "saved" and updates it through onChange.
function WishlistButton({ productId, saved, onChange }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleClick = async () => {
    // ignore extra clicks while a request is already running
    if (saving) return;

    setSaving(true);
    setMessage('');
    setIsError(false);

    try {
      if (saved) {
        await removeFromWishlist(productId);
        onChange(productId, false);
        setMessage('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        onChange(productId, true);
        setMessage('♥ Added to Wishlist');
      }
    } catch (err) {
      if (err.status === 409) {
        // backend says it is already saved -> just show it as saved
        onChange(productId, true);
        setMessage('Already in your wishlist');
      } else if (err.status === 404 && saved) {
        // it was already removed (maybe in another tab)
        onChange(productId, false);
      } else {
        setIsError(true);
        setMessage(saved ? 'Unable to remove product. Please try again.' : 'Unable to save product. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  let label = '♡ Add to Wishlist';
  if (saving) label = '⏳ Saving...';
  else if (saved) label = '♥ Remove from Wishlist';

  return (
    <div className="wishlist-action">
      <button
        type="button"
        className={`btn btn-block ${saved ? 'btn-wishlist-saved' : 'btn-outline'}`}
        onClick={handleClick}
        disabled={saving}
      >
        {label}
      </button>
      {message && <p className={`wishlist-msg ${isError ? 'is-error' : ''}`}>{message}</p>}
    </div>
  );
}

export default WishlistButton;
