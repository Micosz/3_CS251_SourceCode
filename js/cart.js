/* ============================================================
   ZOO WEB APP - CART
   Fixes:
   - Exposes CART on window for page scripts.
   - Normalizes ids and quantities so + / - buttons update correctly.
   - Re-renders pages through a cart:changed event when items change.
   - Guards localStorage and helper calls so one script error does not break UI.
   ============================================================ */

(function () {
  'use strict';

  const CART_KEY = 'zoo_cart';
  const PROMO_KEY = 'zoo_promo';

  function toId(value) {
    return String(value == null ? '' : value);
  }

  function toQty(value) {
    const qty = parseInt(value, 10);
    return Number.isFinite(qty) && qty > 0 ? qty : 0;
  }

  function toMoney(value) {
    const money = Number(value);
    return Number.isFinite(money) ? money : 0;
  }

  function notifyCartChanged() {
    if (typeof window.updateCartBadge === 'function') {
      window.updateCartBadge();
    }

    window.dispatchEvent(new CustomEvent('cart:changed', {
      detail: { items: CART.getItems() }
    }));
  }

  const CART = {
    getItems() {
      try {
        const data = localStorage.getItem(CART_KEY);
        const items = data ? JSON.parse(data) : [];
        if (!Array.isArray(items)) return [];

        return items
          .map(function (item) {
            return {
              id: toId(item.id),
              type: item.type || item.nameTH || 'Ticket',
              nameTH: item.nameTH || item.type || 'Ticket',
              icon: item.icon || '',
              image: item.image || '',
              ageRange: item.ageRange || '',
              price: toMoney(item.price),
              isFree: !!item.isFree || toMoney(item.price) === 0,
              qty: toQty(item.qty)
            };
          })
          .filter(function (item) {
            return item.id && item.qty > 0;
          });
      } catch (err) {
        console.error('Cart read error:', err);
        return [];
      }
    },

    _save(items) {
      const normalized = (Array.isArray(items) ? items : [])
        .map(function (item) {
          return {
            id: toId(item.id),
            type: item.type || item.nameTH || 'Ticket',
            nameTH: item.nameTH || item.type || 'Ticket',
            icon: item.icon || '',
            image: item.image || '',
            ageRange: item.ageRange || '',
            price: toMoney(item.price),
            isFree: !!item.isFree || toMoney(item.price) === 0,
            qty: toQty(item.qty)
          };
        })
        .filter(function (item) {
          return item.id && item.qty > 0;
        });

      localStorage.setItem(CART_KEY, JSON.stringify(normalized));
      notifyCartChanged();
    },

    addItem(ticketType, qty) {
      const ticket = ticketType || {};
      const id = toId(ticket.id);
      const amount = toQty(qty == null ? 1 : qty);
      if (!id || amount <= 0) return;

      const items = this.getItems();
      const existing = items.find(function (item) {
        return item.id === id;
      });

      if (existing) {
        existing.qty += amount;
      } else {
        items.push({
          id: id,
          type: ticket.type || ticket.nameTH || 'Ticket',
          nameTH: ticket.nameTH || ticket.type || 'Ticket',
          icon: ticket.icon || '',
          image: ticket.image || '',
          ageRange: ticket.ageRange || '',
          price: toMoney(ticket.price),
          isFree: !!ticket.isFree || toMoney(ticket.price) === 0,
          qty: amount
        });
      }

      this._save(items);
    },

    setQty(ticketId, qty) {
      const id = toId(ticketId);
      const nextQty = toQty(qty);
      const items = this.getItems();
      const existing = items.find(function (item) {
        return item.id === id;
      });

      if (!existing) return;

      if (nextQty <= 0) {
        this.removeItem(id);
        return;
      }

      existing.qty = nextQty;
      this._save(items);
    },

    removeItem(ticketId) {
      const id = toId(ticketId);
      this._save(this.getItems().filter(function (item) {
        return item.id !== id;
      }));
    },

    getQty(ticketId) {
      const id = toId(ticketId);
      const item = this.getItems().find(function (cartItem) {
        return cartItem.id === id;
      });
      return item ? item.qty : 0;
    },

    getCount() {
      return this.getItems().reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);
    },

    getSubtotal() {
      return this.getItems().reduce(function (sum, item) {
        return sum + (item.price * item.qty);
      }, 0);
    },

    getPromo() {
      try {
        const data = localStorage.getItem(PROMO_KEY);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        return null;
      }
    },

    async applyPromo(code) {
      const subtotal = this.getSubtotal();
      const normalizedCode = String(code || '').trim();

      if (!normalizedCode) {
        return { valid: false, message: 'Please enter a promotion code.' };
      }

      try {
        // Fix: validate against the Promotion table instead of hard-coded frontend values.
        const res = await fetch('/api/promotions/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: normalizedCode })
        });

        const result = await res.json();

        if (!res.ok || !result.success || !result.data) {
          return {
            valid: false,
            message: result.message || 'Promotion code is invalid or expired.'
          };
        }

        const promo = result.data;
        const discountAmount = Math.min(subtotal, toMoney(promo.DiscountAmount));

        localStorage.setItem(PROMO_KEY, JSON.stringify({
          id: promo.PromotionID,
          code: promo.PromotionCode,
          discountAmount: discountAmount,
          description: promo.Conditions || '',
          expireDate: promo.PromotionExpireDate || ''
        }));

        notifyCartChanged();

        return {
          valid: true,
          promo: {
            id: promo.PromotionID,
            code: promo.PromotionCode
          },
          discountAmount: discountAmount,
          message: promo.Conditions || 'Promotion applied.'
        };
      } catch (err) {
        console.error('Promotion validation error:', err);
        return {
          valid: false,
          message: 'Cannot validate promotion code.'
        };
      }
    },

    removePromo() {
      localStorage.removeItem(PROMO_KEY);
      notifyCartChanged();
    },

    getDiscount() {
      const promo = this.getPromo();
      return promo ? Math.min(this.getSubtotal(), toMoney(promo.discountAmount)) : 0;
    },

    getTotal() {
      return Math.max(0, this.getSubtotal() - this.getDiscount());
    },

    isEmpty() {
      return this.getCount() === 0;
    },

    clear() {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(PROMO_KEY);
      notifyCartChanged();
    }
  };

  window.CART = CART;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyCartChanged);
  } else {
    notifyCartChanged();
  }
})();
