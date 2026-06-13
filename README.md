# 🌿 Kaprao POS — ระบบขายหน้าร้านข้าวกะเพรา

ระบบ POS สำหรับร้านอาหาร เชื่อมต่อกับ Google Sheets สำหรับบันทึกข้อมูลการขาย

---

## 📋 โครงสร้างโปรเจกต์

```
kaprao-pos/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                  # routing + nav
│   ├── index.js                 # entry point
│   ├── context/
│   │   └── CartContext.jsx      # state ตะกร้า + checkout
│   ├── hooks/
│   │   ├── useMenu.js           # ดึงเมนูจาก Sheets
│   │   └── useReports.js        # ดึงรายงานจาก Sheets
│   ├── pages/
│   │   ├── POSPage.jsx          # หน้าขาย
│   │   └── ReportsPage.jsx      # หน้ารายงาน
│   └── utils/
│       └── sheetsApi.js         # Google Sheets API helper
├── .env.example                 # template ตัวแปร env
├── .gitignore
└── package.json
```

---

## 🚀 วิธีติดตั้งและรัน

```bash
git clone https://github.com/YOUR_USERNAME/kaprao-pos.git
cd kaprao-pos
npm install

# copy ไฟล์ env
cp .env.example .env
# แก้ไข .env ใส่ key จริง

npm start
```

---

## 🔑 ตั้งค่า Google Sheets

### ขั้นตอนที่ 1: เตรียม Sheet

เปิด Google Sheets:
`https://docs.google.com/spreadsheets/d/15i5zqz_TCYUvl7jtDb86NFwCyVyeORcvqCQYVgu0l2Y/edit`

สร้าง tab ดังนี้:

#### tab: `menu`
| id | name | category | price | available | emoji |
|----|------|----------|-------|-----------|-------|
| 1 | ข้าวกะเพราหมูสับ | กะเพรา | 60 | true | 🍚 |
| 2 | ข้าวกะเพราไก่ | กะเพรา | 60 | true | 🍗 |
| 3 | ข้าวกะเพรากุ้ง | กะเพรา | 80 | true | 🍤 |

#### tab: `orders`
| timestamp | name | category | qty | unitPrice | lineTotal | payment | note |
|-----------|------|----------|-----|-----------|-----------|---------|------|

#### tab: `expenses`
| timestamp | category | amount | note |
|-----------|----------|--------|------|

---

### ขั้นตอนที่ 2: เปิดสิทธิ์ Sheet

ไปที่ **Share → Anyone with the link → Viewer**

---

### ขั้นตอนที่ 3: สร้าง Google API Key (สำหรับ READ)

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่
3. เปิด **Google Sheets API**
4. ไปที่ **APIs & Services → Credentials → Create API Key**
5. Copy key ใส่ใน `.env`:
   ```
   REACT_APP_GOOGLE_API_KEY=AIza...
   ```

---

### ขั้นตอนที่ 4: Apps Script สำหรับ WRITE (บันทึกออเดอร์)

1. เปิด Google Sheets → **Extensions → Apps Script**
2. วางโค้ดนี้:

```javascript
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(body.sheet) || ss.insertSheet(body.sheet);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row     = headers.map(h => body.data[h] ?? "");
  sheet.appendRow(row);
  
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy URL ใส่ใน `.env`:
   ```
   REACT_APP_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   ```

---

## 📦 Deploy บน Vercel / Netlify

```bash
npm run build
# อัปโหลด /build ขึ้น hosting ที่ต้องการ
```

อย่าลืมตั้ง Environment Variables บน hosting ด้วย

---

## 🗺️ Roadmap

- [ ] พิมพ์ใบเสร็จ
- [ ] รายงานกำไรรายวัน/สัปดาห์
- [ ] บันทึกรายจ่ายในแอป
- [ ] ระบบ login สำหรับหลายสาขา
