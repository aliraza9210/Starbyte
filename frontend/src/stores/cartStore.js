import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, plan = null, quantity = 1) => {
        const { items } = get();
        const itemKey = plan ? `${product._id}-${plan._id || plan.name}` : product._id;
        const existing = items.find(i => i.key === itemKey);

        if (existing) {
          set({ items: items.map(i => 
            i.key === itemKey 
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )});
        } else {
          const unitPrice = (product.plans?.length > 1 && plan?.price)
            ? plan.price
            : (product.price ?? plan?.price ?? 0);
          set({ items: [...items, {
            key: itemKey,
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              thumbnail: product.thumbnail,
              price: product.price,
              originalPrice: product.originalPrice,
              currency: product.currency || 'USD',
              duration: product.duration
            },
            plan: plan ? {
              _id: plan._id,
              name: plan.name,
              price: plan.price,
              duration: plan.duration
            } : null,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity
          }]});
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter(i => i.key !== key) });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({ items: get().items.map(i => 
          i.key === key 
            ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
            : i
        )});
      },

      clearCart: () => set({ items: [] }),

      get subtotal() {
        return parseFloat(get().items.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2));
      },

      get total() {
        return get().subtotal;
      },

      get itemCount() {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      }
    }),
    { name: 'starbyte-cart', version: 1 }
  )
);

export default useCartStore;
