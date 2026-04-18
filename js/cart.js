/* ============================================================
   ZOO WEBAPP — CART.JS
   Shopping cart state management using localStorage
   ============================================================ */

const CART_KEY = 'zoo_cart';
const PROMO_KEY = 'zoo_promo';

const CART = {
  /**
   * Get all cart items from localStorage
   */
  getItems() {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save items to localStorage
   */
  _save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  /**
   * Add or update a ticket in the cart
   * ticketType: { id, type, price, icon, ageRange, nameTH, ... }
   * qty: number to add
   */
  addItem(ticketType, qty = 1) {
    if (ticketType.isFree) {
      // Free tickets can be added but priced at 0
    }
    const items = this.getItems();
    const existing = items.find(i => i.id === ticketType.id);
    if (existing) {
      existing.qty = Math.max(0, existing.qty + qty);
      if (existing.qty === 0) {
        this._save(items.filter(i => i.id !== ticketType.id));
      } else {
        this._save(items);
      }
    } else {
      if (qty > 0) {
        items.push({
          id: ticketType.id,
          type: ticketType.type,
          nameTH: ticketType.nameTH,
          icon: ticketType.icon,
          ageRange: ticketType.ageRange,
          price: ticketType.price,
          isFree: ticketType.isFree,
          qty
        });
        this._save(items);
      }
    }
    updateCartBadge();
  },

  /**
   * Set exact quantity for a ticket type
   */
  setQty(ticketId, qty) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === ticketId);
    if (qty <= 0) {
      if (idx !== -1) items.splice(idx, 1);
    } else {
      if (idx !== -1) {
        items[idx].qty = qty;
      }
    }
    this._save(items);
    updateCartBadge();
  },

  /**
   * Remove a ticket type completely
   */
  removeItem(ticketId) {
    const items = this.getItems().filter(i => i.id !== ticketId);
    this._save(items);
    updateCartBadge();
  },

  /**
   * Get total item count (sum of quantities)
   */
  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  /**
   * Get subtotal (before discount)
   */
  getSubtotal() {
    return this.getItems().reduce((sum, i) => sum + (i.price * i.qty), 0);
  },

  /**
   * Get applied promo
   */
  getPromo() {
    try {
      const data = localStorage.getItem(PROMO_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Apply a promo code
   */
  applyPromo(code) {
    const subtotal = this.getSubtotal();
    const result = validatePromo(code, subtotal);
    if (result.valid) {
      localStorage.setItem(PROMO_KEY, JSON.stringify({
        code: result.promo.code,
        discountAmount: result.discountAmount,
        description: result.message
      }));
    }
    return result;
  },

  /**
   * Remove applied promo
   */
  removePromo() {
    localStorage.removeItem(PROMO_KEY);
  },

  /**
   * Get discount amount
   */
  getDiscount() {
    const promo = this.getPromo();
    return promo ? promo.discountAmount : 0;
  },

  /**
   * Get final total (after discount)
   */
  getTotal() {
    return Math.max(0, this.getSubtotal() - this.getDiscount());
  },

  /**
   * Check if cart is empty
   */
  isEmpty() {
    return this.getItems().length === 0 || this.getCount() === 0;
  },

  /**
   * Clear cart and promo
   */
  clear() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(PROMO_KEY);
    updateCartBadge();
  },

  /**
   * Get quantity for a specific ticket type
   */
  getQty(ticketId) {
    const item = this.getItems().find(i => i.id === ticketId);
    return item ? item.qty : 0;
  }
};
