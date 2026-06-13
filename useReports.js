/**
 * hooks/useReports.js
 * ดึงข้อมูล orders + expenses จาก Google Sheets สำหรับหน้ารายงาน
 */
import { useState, useEffect } from "react";
import { readSheet, SHEETS } from "../utils/sheetsApi";
import dayjs from "dayjs";

export function useReports(month) {
  // month = "YYYY-MM" string, e.g. "2025-06"
  const [orders,   setOrders]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      readSheet(SHEETS.ORDERS),
      readSheet(SHEETS.EXPENSES),
    ])
      .then(([orderRows, expenseRows]) => {
        if (cancelled) return;

        const inMonth = rows =>
          rows.filter(r => {
            const d = dayjs(r.timestamp || r.date, ["D/M/YYYY HH:mm:ss", "YYYY-MM-DD"]);
            return d.isValid() && d.format("YYYY-MM") === month;
          });

        setOrders(inMonth(orderRows));
        setExpenses(inMonth(expenseRows));
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [month]);

  const totalIncome  = orders.reduce((s, r)   => s + parseFloat(r.lineTotal || r.total || 0), 0);
  const totalExpense = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const profit       = totalIncome - totalExpense;

  return { orders, expenses, totalIncome, totalExpense, profit, loading, error };
}
