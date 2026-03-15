// Shared cart + navbar helpers for HealthEase

function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem('he_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem('he_cart', JSON.stringify(items));
}

function getCartCount() {
  const items = getCartItems();
  return items.reduce((sum, item) => sum + (item.qty || 1), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count > 0 ? count : '';
}

function showCartToast() {
  const toastEl = document.getElementById('cartToast');
  if (!toastEl || typeof bootstrap === 'undefined') return;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
  toast.show();
}

function addToCart(product) {
  const items = getCartItems();
  const existing = items.find((p) => p.id === product.id);

  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      qty: 1
    });
  }

  saveCartItems(items);
  updateCartBadge();
  showCartToast();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});

