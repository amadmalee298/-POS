/**
 * pages/POSPage.jsx
 * หน้า POS หลัก: เลือกเมนู + ตะกร้า + ชำระเงิน
 */
import { useState } from "react";
import { useMenu }  from "../hooks/useMenu";
import { useCart }  from "../context/CartContext";

const PAYMENT_METHODS = ["เงินสด", "QR Code", "โอน"];

export default function POSPage() {
  const { menu, categories, loading, error } = useMenu();
  const { cart, dispatch, total, checkout }  = useCart();
  const [selectedCat, setSelectedCat]        = useState("ทั้งหมด");
  const [payment, setPayment]                = useState("เงินสด");
  const [status, setStatus]                  = useState(null); // null | "loading" | "success" | "error"

  const allCats = ["ทั้งหมด", ...categories];
  const filtered = selectedCat === "ทั้งหมด"
    ? menu
    : menu.filter(m => m.category === selectedCat);

  async function handleCheckout() {
    setStatus("loading");
    const result = await checkout(payment);
    setStatus(result.ok ? "success" : "error");
    if (result.ok) setTimeout(() => setStatus(null), 2500);
  }

  if (loading) return <div style={s.center}>⏳ กำลังโหลดเมนู...</div>;
  if (error)   return <div style={s.center}>❌ {error}</div>;

  return (
    <div style={s.layout}>
      {/* ─── LEFT: เมนู ─── */}
      <div style={s.menuPanel}>
        <div style={s.catBar}>
          {allCats.map(c => (
            <button key={c}
              style={selectedCat === c ? { ...s.catBtn, ...s.catActive } : s.catBtn}
              onClick={() => setSelectedCat(c)}>{c}</button>
          ))}
        </div>

        <div style={s.menuGrid}>
          {filtered.map(item => (
            <button key={item.id} style={s.menuCard}
              onClick={() => dispatch({ type: "ADD_ITEM", item })}>
              <span style={s.menuEmoji}>{item.emoji}</span>
              <span style={s.menuName}>{item.name}</span>
              <span style={s.menuPrice}>฿{item.price.toFixed(0)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT: ตะกร้า ─── */}
      <div style={s.cartPanel}>
        <div style={s.cartHeader}>🛒 ออเดอร์</div>

        <div style={s.cartItems}>
          {cart.items.length === 0
            ? <div style={s.emptyCart}>เพิ่มเมนูด้านซ้าย</div>
            : cart.items.map(item => (
              <div key={item.id} style={s.cartRow}>
                <span style={s.cartName}>{item.name}</span>
                <div style={s.qtyControl}>
                  <button style={s.qtyBtn}
                    onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty - 1 })}>−</button>
                  <span style={s.qty}>{item.qty}</span>
                  <button style={s.qtyBtn}
                    onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty + 1 })}>+</button>
                </div>
                <span style={s.lineTotal}>฿{(item.price * item.qty).toFixed(0)}</span>
              </div>
            ))
          }
        </div>

        <textarea placeholder="หมายเหตุ..." style={s.noteInput}
          value={cart.note}
          onChange={e => dispatch({ type: "SET_NOTE", note: e.target.value })} />

        <div style={s.payRow}>
          {PAYMENT_METHODS.map(m => (
            <button key={m}
              style={payment === m ? { ...s.payBtn, ...s.payActive } : s.payBtn}
              onClick={() => setPayment(m)}>{m}</button>
          ))}
        </div>

        <div style={s.totalRow}>
          <span>รวม</span>
          <span style={s.totalAmt}>฿{total.toFixed(2)}</span>
        </div>

        <button style={s.checkoutBtn} disabled={cart.items.length === 0 || status === "loading"}
          onClick={handleCheckout}>
          {status === "loading" ? "⏳ กำลังบันทึก..." : status === "success" ? "✅ สำเร็จ!" : "ชำระเงิน"}
        </button>

        {status === "error" && <div style={s.errMsg}>❌ บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง</div>}

        <button style={s.clearBtn} onClick={() => dispatch({ type: "CLEAR" })}>ล้างออเดอร์</button>
      </div>
    </div>
  );
}

const s = {
  layout:     { display: "flex", height: "calc(100vh - 56px)", fontFamily: "'Sarabun','Noto Sans Thai',sans-serif" },
  menuPanel:  { flex: 1, display: "flex", flexDirection: "column", background: "#FAF7F0", overflow: "hidden" },
  catBar:     { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #E5E7EB" },
  catBtn:     { padding: "6px 14px", borderRadius: 20, border: "1.5px solid #D1D5DB", background: "#F9FAFB", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", color: "#374151" },
  catActive:  { background: "#1B4332", color: "#fff", borderColor: "#1B4332" },
  menuGrid:   { flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, padding: 16, overflowY: "auto", alignContent: "start" },
  menuCard:   { background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "inherit", transition: "box-shadow 0.15s" },
  menuEmoji:  { fontSize: 28 },
  menuName:   { fontSize: 13, fontWeight: 700, color: "#1F2937", textAlign: "center" },
  menuPrice:  { fontSize: 14, color: "#1B4332", fontWeight: 800 },
  cartPanel:  { width: 320, background: "#fff", borderLeft: "1px solid #E5E7EB", display: "flex", flexDirection: "column", padding: 16, gap: 10, overflowY: "auto" },
  cartHeader: { fontSize: 16, fontWeight: 800, color: "#1B4332" },
  cartItems:  { flex: 1, overflowY: "auto", minHeight: 80 },
  emptyCart:  { color: "#9CA3AF", fontSize: 13, textAlign: "center", marginTop: 32 },
  cartRow:    { display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #F3F4F6" },
  cartName:   { flex: 1, fontSize: 13, fontWeight: 600, color: "#1F2937" },
  qtyControl: { display: "flex", alignItems: "center", gap: 4 },
  qtyBtn:     { width: 26, height: 26, borderRadius: "50%", border: "1.5px solid #D1D5DB", background: "#F9FAFB", fontSize: 15, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  qty:        { width: 24, textAlign: "center", fontSize: 14, fontWeight: 700 },
  lineTotal:  { fontSize: 13, fontWeight: 700, color: "#1B4332", width: 48, textAlign: "right" },
  noteInput:  { border: "1.5px solid #D1D5DB", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", resize: "none", height: 60 },
  payRow:     { display: "flex", gap: 6 },
  payBtn:     { flex: 1, padding: "7px 0", border: "1.5px solid #D1D5DB", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "#F9FAFB", fontFamily: "inherit", color: "#374151" },
  payActive:  { background: "#1B4332", color: "#fff", borderColor: "#1B4332" },
  totalRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "2px solid #E5E7EB" },
  totalAmt:   { fontSize: 22, fontWeight: 800, color: "#1B4332" },
  checkoutBtn:{ background: "#1B4332", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
  clearBtn:   { background: "transparent", color: "#9CA3AF", border: "none", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" },
  errMsg:     { color: "#C0392B", fontSize: 13, textAlign: "center" },
  center:     { display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", fontSize: 16 },
};
