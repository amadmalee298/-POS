/**
 * pages/ReportsPage.jsx
 * หน้ารายงานรายรับ-รายจ่ายจาก Google Sheets
 */
import { useState } from "react";
import { useReports } from "../hooks/useReports";
import dayjs from "dayjs";

function fmt(n) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

export default function ReportsPage() {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const { orders, expenses, totalIncome, totalExpense, profit, loading, error } = useReports(month);

  return (
    <div style={s.page}>
      <div style={s.topRow}>
        <h2 style={s.heading}>📊 รายงาน</h2>
        <input type="month" value={month} style={s.monthInput}
          onChange={e => setMonth(e.target.value)} />
      </div>

      {loading && <div style={s.msg}>⏳ กำลังโหลด...</div>}
      {error   && <div style={s.err}>❌ {error}</div>}

      {!loading && !error && (
        <>
          <div style={s.cards}>
            <div style={{ ...s.card, borderTop: "4px solid #E8A020" }}>
              <div style={s.cardLabel}>รายรับรวม</div>
              <div style={{ ...s.cardAmt, color: "#E8A020" }}>฿{fmt(totalIncome)}</div>
              <div style={s.cardSub}>{orders.length} รายการ</div>
            </div>
            <div style={{ ...s.card, borderTop: "4px solid #C0392B" }}>
              <div style={s.cardLabel}>รายจ่ายรวม</div>
              <div style={{ ...s.cardAmt, color: "#C0392B" }}>฿{fmt(totalExpense)}</div>
              <div style={s.cardSub}>{expenses.length} รายการ</div>
            </div>
            <div style={{ ...s.card, borderTop: `4px solid ${profit >= 0 ? "#1B4332" : "#C0392B"}`, gridColumn: "1 / -1" }}>
              <div style={s.cardLabel}>กำไรสุทธิ</div>
              <div style={{ ...s.cardAmt, fontSize: 28, color: profit >= 0 ? "#1B4332" : "#C0392B" }}>฿{fmt(profit)}</div>
            </div>
          </div>

          <h3 style={s.sectionTitle}>รายการขายล่าสุด</h3>
          <div style={s.table}>
            <div style={s.thead}>
              <span style={{ flex: 2 }}>เวลา</span>
              <span style={{ flex: 2 }}>เมนู</span>
              <span style={{ flex: 1, textAlign: "right" }}>ยอด</span>
            </div>
            {orders.slice(-30).reverse().map((o, i) => (
              <div key={i} style={s.trow}>
                <span style={{ flex: 2, fontSize: 12, color: "#6B7280" }}>{o.timestamp}</span>
                <span style={{ flex: 2, fontSize: 13 }}>{o.name || o.items || "—"}</span>
                <span style={{ flex: 1, textAlign: "right", fontWeight: 700, color: "#1B4332" }}>฿{fmt(parseFloat(o.lineTotal || o.total || 0))}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  page:         { padding: 20, fontFamily: "'Sarabun','Noto Sans Thai',sans-serif", background: "#FAF7F0", minHeight: "calc(100vh - 56px)" },
  topRow:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  heading:      { margin: 0, fontSize: 20, color: "#1B4332" },
  monthInput:   { border: "1.5px solid #D1D5DB", borderRadius: 8, padding: "6px 12px", fontSize: 14, fontFamily: "inherit" },
  msg:          { textAlign: "center", color: "#6B7280", padding: 32 },
  err:          { textAlign: "center", color: "#C0392B", padding: 32 },
  cards:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 },
  card:         { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardLabel:    { fontSize: 12, color: "#6B7280", fontWeight: 600 },
  cardAmt:      { fontSize: 22, fontWeight: 800, marginTop: 4 },
  cardSub:      { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 10 },
  table:        { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  thead:        { display: "flex", padding: "10px 14px", background: "#F3F4F6", fontSize: 12, fontWeight: 700, color: "#6B7280" },
  trow:         { display: "flex", padding: "10px 14px", borderTop: "1px solid #F3F4F6", alignItems: "center" },
};
