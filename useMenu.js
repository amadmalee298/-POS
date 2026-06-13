/**
 * hooks/useMenu.js
 * ดึงเมนูจาก Google Sheets tab "menu"
 *
 * คอลัมน์ที่คาดหวังใน Sheet:
 *   id | name | category | price | available | emoji
 */
import { useState, useEffect } from "react";
import { readSheet, SHEETS } from "../utils/sheetsApi";

export function useMenu() {
  const [menu, setMenu]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    readSheet(SHEETS.MENU)
      .then(rows => {
        if (cancelled) return;
        const items = rows
          .filter(r => r.available?.toLowerCase() !== "false" && r.available !== "0")
          .map(r => ({
            id:       r.id || r.name,
            name:     r.name,
            category: r.category || "ทั่วไป",
            price:    parseFloat(r.price) || 0,
            emoji:    r.emoji || "🍽️",
          }));
        setMenu(items);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const categories = [...new Set(menu.map(m => m.category))];

  return { menu, categories, loading, error };
}
