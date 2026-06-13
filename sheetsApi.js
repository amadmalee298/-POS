/**
 * utils/sheetsApi.js
 * ──────────────────────────────────────────────────────────────
 * ติดต่อ Google Sheets ผ่าน Google Sheets API v4 (read-only public)
 * หรือ Apps Script Web App (read + write)
 *
 * Sheet ID: 15i5zqz_TCYUvl7jtDb86NFwCyVyeORcvqCQYVgu0l2Y
 *
 * ── วิธีใช้ (2 โหมด) ─────────────────────────────────────────
 * โหมด A: READ via Google Sheets API v4 (ต้องตั้ง Sheet เป็น "Anyone with link can view")
 *          → ต้องมี REACT_APP_GOOGLE_API_KEY
 *
 * โหมด B: READ + WRITE via Apps Script Web App (แนะนำ)
 *          → deploy Apps Script → เอา URL ใส่ REACT_APP_APPS_SCRIPT_URL
 * ─────────────────────────────────────────────────────────────
 */

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY  = process.env.REACT_APP_GOOGLE_API_KEY;
const APPS_SCRIPT_URL = process.env.REACT_APP_APPS_SCRIPT_URL; // optional

// ── Sheet tab names ───────────────────────────────────────────
export const SHEETS = {
  ORDERS:   "orders",    // คำสั่งซื้อ
  MENU:     "menu",      // เมนู
  EXPENSES: "expenses",  // รายจ่าย
  INCOME:   "income",    // รายรับ (summary)
};

// ─────────────────────────────────────────────────────────────
// READ: ดึงข้อมูลจาก sheet tab
// ─────────────────────────────────────────────────────────────
export async function readSheet(sheetName) {
  if (!SHEET_ID) throw new Error("REACT_APP_SHEET_ID ไม่ได้ตั้งค่า");
  if (!API_KEY)  throw new Error("REACT_APP_GOOGLE_API_KEY ไม่ได้ตั้งค่า");

  const range = encodeURIComponent(`${sheetName}!A1:Z1000`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Google Sheets API error");
  }

  const data = await res.json();
  const rows = data.values || [];
  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))
  );
}

// ─────────────────────────────────────────────────────────────
// WRITE: บันทึกข้อมูลผ่าน Apps Script Web App
// ─────────────────────────────────────────────────────────────
export async function writeToSheet(sheetName, rowData) {
  if (!APPS_SCRIPT_URL) {
    console.warn("REACT_APP_APPS_SCRIPT_URL ไม่ได้ตั้งค่า — ข้ามการ write");
    return { ok: false, reason: "no_apps_script_url" };
  }

  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet: sheetName, data: rowData }),
  });

  const json = await res.json();
  return json;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** แปลง row object → array ตามลำดับ headers */
export function rowToArray(obj, headers) {
  return headers.map(h => obj[h] ?? "");
}

/** timestamp ไทย สำหรับบันทึก */
export function thaiTimestamp() {
  return new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
}
