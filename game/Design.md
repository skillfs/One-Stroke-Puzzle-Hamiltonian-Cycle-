# Design System — One Stroke

ไฟล์นี้คือ **รากฐานการออกแบบ** ของเกม ทุกครั้งที่จะสร้าง/แก้อะไรที่เกี่ยวกับการแสดงผล
ให้ยึดค่าจากไฟล์นี้ ห้าม hard-code ตัวเลขสุ่มๆ ลงใน scene โดยตรง

ค่าทั้งหมดถูกแปลงเป็นโค้ดไว้ใน `src/config/GameConfig.ts` (ใช้ผ่าน `LAYOUT`, `TYPO`, `SPACING`, `COLORS`)

---

## 1. หลักการ (Principles)

1. **Center-first** — ทุก element จัดกึ่งกลางแนวนอนที่ `LAYOUT.centerX` (= 240) เสมอ
   ถ้าวางหลายชิ้นเรียงกัน ให้คำนวณ `startX` จากจุดกึ่งกลาง ไม่ใช่เดาเลข
2. **Vertical rhythm** — ระยะห่างแนวตั้งใช้ค่าจาก `SPACING` เท่านั้น (ทวีคูณของ 8)
3. **Flat & minimal** — ไม่มี gradient/shadow/เส้นขอบมั่ว ใช้สีพื้นเรียบ + ระยะห่างเป็นตัวจัดระเบียบ
4. **Token เดียวคุมทั้งเกม** — เปลี่ยนสี/ขนาด/ระยะ แก้ที่ `GameConfig.ts` ที่เดียว

---

## 2. Canvas

| ค่า | px |
|-----|-----|
| width | 480 |
| height | 640 |
| centerX | 240 |
| centerY | 320 |
| ขอบซ้าย/ขวาที่ปลอดภัย (safe margin) | 24 |
| ความกว้างพื้นที่เนื้อหา | 432 (480 − 24×2) |

scale mode = `FIT` + `CENTER_BOTH` → ปรับขนาดอัตโนมัติทุกหน้าจอ (PC/Mobile)

---

## 3. สี (Color) — `COLORS`

| Token | Hex | ใช้กับ |
|-------|-----|--------|
| `primary` | `#534AB7` | เส้นทาง/ปุ่มหลัก/tab ที่เลือก |
| `secondary` | `#5DCAA5` | ด่านที่ผ่านแล้ว/สำเร็จ |
| `endpoint` | `#D85A30` | จุดเริ่มต้น |
| `empty` | `#2a2a4e` | ช่องว่าง/ปุ่มรอง |
| `bg` | `#1a1a2e` | พื้นหลัง scene |
| `bgPanel` | `#16162a` | ช่องที่ถูก lock |
| `text` | `#ffffff` | ข้อความหลัก |
| `textMuted` | `#888888` | ข้อความรอง/คำอธิบาย |
| `textDisabled` | `#444444` | ข้อความที่ใช้ไม่ได้ |
| `gold` | `#EF9F27` | คะแนน/highlight |

กฎ: ข้อความบนพื้นสี ใช้ `text` (#fff) เสมอ ยกเว้นบนพื้น `secondary`/`gold` ที่สว่าง ให้ใช้ `bg` (#1a1a2e)

---

## 4. ตัวอักษร (Typography) — `TYPO`

font-family: `'Sarabun', 'Segoe UI', sans-serif` (รองรับไทย) — กำหนดที่ `TYPO.family`

| Token | size | weight | ใช้กับ |
|-------|------|--------|--------|
| `display` | 42 | bold | ชื่อเกมหน้าแรก |
| `h1` | 28 | bold | หัวข้อ scene |
| `h2` | 22 | bold | หัวข้อรอง/ผลลัพธ์ |
| `h3` | 18 | normal | ปุ่ม/label เด่น |
| `body` | 16 | normal | ข้อความทั่วไป |
| `label` | 14 | normal | header bar/ตัวนับ |
| `caption` | 12 | normal | คำอธิบายเล็ก |

**สองน้ำหนักเท่านั้น**: normal / bold — ห้ามใช้ weight อื่น

---

## 5. ระยะห่าง (Spacing) — `SPACING`

ฐาน 8px ทุกระยะห่าง (padding, gap, margin) ต้องเป็นค่าจากนี้

| Token | px |
|-------|-----|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 16 |
| `lg` | 24 |
| `xl` | 32 |
| `xxl` | 48 |

---

## 6. Component Specs

### Button — `LAYOUT.button`
- width: 220, height: 48
- radius: 8 (rectangle ปกติ)
- gap ระหว่างปุ่มที่เรียงกัน: `SPACING.md` (16) → ระยะห่าง center-to-center = 48 + 16 = **64**
- **primary**: พื้น `primary`, ข้อความ `h3` สีขาว
- **secondary**: พื้น `empty`, ข้อความ `h3` สีขาว
- hover: `setAlpha(0.85)` / out: `setAlpha(1)`
- ถ้าปุ่มยิง action ที่ต้องคิด ให้ใช้ helper `createButton()` เสมอ ไม่วาดเอง

### Tab (เลือกความยาก)
- width: 116, height: 40, gap: `SPACING.sm` (8)
- 3 tab → ความกว้างรวม = 3×116 + 2×8 = 364 → `startX = centerX − 182`
- ที่เลือก: พื้น `primary` / ไม่เลือก: พื้น `empty`
- ข้อความ `h3` สีขาว

### Game cell (ช่องในกระดานเล่น)
- ขนาดคำนวณอัตโนมัติจาก `gridN` ให้พอดีพื้นที่ (ดู `CELL.gap`, `cornerRadius`)
- สี: `endpoint`=จุดเริ่ม, `primary`=ในเส้นทาง, `empty`=ว่าง

### Level cell (ปุ่มเลือกด่าน)
- ขนาด 70×70, gap `SPACING.sm` (8), 5 คอลัมน์
- ความกว้างรวม = 5×70 + 4×8 = 382 → `offsetX = centerX − 191`
- ผ่านแล้ว: พื้น `secondary` + เครื่องหมาย `✓`
- เล่นได้: พื้น `empty` / ถูก lock: พื้น `bgPanel`
- เลขด่าน: `h3`

### Header bar (ในเกม)
- Back ซ้ายสุด (x=`safeMargin`), ชื่อด่านกึ่งกลาง, Reset ขวาสุด (x=`width−safeMargin`)
- ทุกตัว `label` (14) — Back/Reset สี `textMuted`, ชื่อด่านสี `primary`
- ตัวนับ (X / total) อยู่ใต้ header กึ่งกลาง สี `textMuted`

---

## 7. Layout แต่ละ Scene (พิกัด Y)

ทุก scene จัดกึ่งกลางที่ centerX=240 — ระบุเฉพาะ Y

### MainMenu
| element | y |
|---------|---|
| title (display) | 160 |
| subtitle (caption) | 205 |
| ปุ่ม 1 (เล่นเกม, primary) | 300 |
| ปุ่ม 2 (Endless) | 364 |
| ปุ่ม 3 (ตั้งค่า) | 428 |
| best score (caption) | 540 |

ปุ่มห่าง center-to-center = 64 เท่ากันทุกปุ่ม

### LevelSelect
| element | y |
|---------|---|
| Back / title (h1) | 40 |
| tabs | 100 |
| grid แถวแรก (เริ่ม) | 170 |

### GameScene
| element | y |
|---------|---|
| header bar | 30 |
| ตัวนับ | 60 |
| กระดาน (เริ่ม) | 100 |

### ResultScene
| element | y |
|---------|---|
| "ผ่านแล้ว!" (h1) | 230 |
| ปุ่มแรก | 360 |
| ปุ่มถัดไป | +64 ต่อปุ่ม |

---

## 8. กฎเวลาเพิ่ม UI ใหม่ (Checklist)

- [ ] จัดกึ่งกลางที่ `centerX` — คำนวณ startX จาก center ไม่ใช่เดาเลข
- [ ] ระยะห่างแนวตั้งใช้ค่าจาก `SPACING`
- [ ] font ใช้ token จาก `TYPO` (ส่งผ่าน helper `textStyle()`)
- [ ] สีใช้ token จาก `COLORS`
- [ ] ปุ่มใช้ helper `createButton()` ร่วมกัน ไม่ก๊อปโค้ดวาดเอง
- [ ] ทดสอบทั้งจอกว้าง (PC) และแคบ (Mobile) — FIT mode ช่วยอยู่แล้วแต่เช็ค overflow
