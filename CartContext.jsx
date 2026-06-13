/**
 * context/CartContext.jsx
 * ตะกร้าสินค้า + สถานะ order ของ POS
 */
import { createContext, useContext, useReducer } from "react";
import { writeToSheet, thaiTimestamp, SHEETS } from "../utils/sheetsApi";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const idx = state.items.findIndex(i => i.id === action.item.id);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i),
      };
    }
    case "CLEAR":
      return { ...state, items: [], note: "" };
    case "SET_NOTE":
      return { ...state, note: action.note };
    default:
      return state;
  }
}

const initialState = { items: [], note: "" };

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  async function checkout(paymentMethod = "เงินสด") {
    if (cart.items.length === 0) return { ok: false, reason: "empty_cart" };

    const orderRow = {
      timestamp:     thaiTimestamp(),
      items:         cart.items.map(i => `${i.name}×${i.qty}`).join(", "),
      total:         total,
      payment:       paymentMethod,
      note:          cart.note,
    };

    // บันทึกแต่ละ line item แยก row
    const lineRows = cart.items.map(i => ({
      timestamp:  orderRow.timestamp,
      name:       i.name,
      category:   i.category || "",
      qty:        i.qty,
      unitPrice:  i.price,
      lineTotal:  i.price * i.qty,
      payment:    paymentMethod,
      note:       cart.note,
    }));

    try {
      await Promise.all(lineRows.map(row => writeToSheet(SHEETS.ORDERS, row)));
      dispatch({ type: "CLEAR" });
      return { ok: true, total };
    } catch (err) {
      console.error("checkout error", err);
      return { ok: false, reason: err.message };
    }
  }

  return (
    <CartContext.Provider value={{ cart, dispatch, total, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
