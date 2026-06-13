/**
 * App.jsx — entry point with routing + nav
 */
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import POSPage          from "./pages/POSPage";
import ReportsPage      from "./pages/ReportsPage";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <nav style={s.nav}>
          <span style={s.brand}>🌿 {process.env.REACT_APP_SHOP_NAME || "ร้านข้าวกะเพรา"}</span>
          <div style={s.links}>
            <NavLink to="/"        style={({ isActive }) => isActive ? { ...s.link, ...s.active } : s.link}>🏪 POS</NavLink>
            <NavLink to="/reports" style={({ isActive }) => isActive ? { ...s.link, ...s.active } : s.link}>📊 รายงาน</NavLink>
          </div>
        </nav>

        <Routes>
          <Route path="/"        element={<POSPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

const s = {
  nav:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 56, background: "#1B4332", position: "sticky", top: 0, zIndex: 100 },
  brand:  { color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Sarabun','Noto Sans Thai',sans-serif" },
  links:  { display: "flex", gap: 4 },
  link:   { color: "#86EFAC", textDecoration: "none", padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, fontFamily: "'Sarabun','Noto Sans Thai',sans-serif" },
  active: { background: "rgba(255,255,255,0.15)", color: "#fff" },
};
