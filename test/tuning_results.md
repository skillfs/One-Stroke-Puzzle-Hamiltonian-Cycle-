# Tuning Experiment Results

> วันที่: 2026-06-17
> ไฟล์ทดสอบ: `test/tune_test.js`
> n=30 ด่านต่อ config (Exp F: n=50)

---

## Experiment A — qualityFactor (size=5, weights=default, threshold=default)

| qualityFactor | Easy | Medium | Hard | avg | min | max |
|---|---|---|---|---|---|---|
| 0.5 | 43% | 23% | 33% | 51 | 15 | 100 |
| 1.0 | 57% | 7%  | 37% | 47 | 15 | 100 |
| **2.0** | **27%** | **10%** | **63%** | **65** | **15** | **100** |
| 4.0 | 47% | 13% | 40% | 53 | 15 | 100 |

**สรุป:** qF=2.0 ให้ Hard มากที่สุด แต่ Medium ยังน้อย (10%)

---

## Experiment B — Weights (size=5, qF=1.0, threshold=default)

| weights (dead/branch/nodes) | Easy | Medium | Hard | avg |
|---|---|---|---|---|
| 0.50 / 0.30 / 0.20 (default) | 30% | 17% | 53% | 63 |
| 0.60 / 0.30 / 0.10 | 47% | 20% | 33% | 52 |
| **0.40 / 0.50 / 0.10** | **20%** | **17%** | **63%** | **69** |
| 0.70 / 0.20 / 0.10 | 43% | 20% | 37% | 49 |
| 0.33 / 0.33 / 0.34 | 57% | 10% | 33% | 47 |

**สรุป:** branch weight สูง (0.50) ทำให้ Hard มากขึ้น เพราะ grid 5×5 มี branch point เยอะ

---

## Experiment C — Threshold (size=5, qF=1.0, weights=default)

| threshold | Easy | Medium | Hard | avg |
|---|---|---|---|---|
| easy<30, hard<65 (default) | 33% | 7%  | 60% | 63 |
| easy<20, hard<50 | 23% | 20% | 57% | 53 |
| easy<40, hard<70 | 57% | 7%  | 37% | 45 |
| easy<15, hard<40 | 0%  | 40% | 60% | 55 |

**สรุป:** threshold ส่งผลน้อยกว่าที่คาด เพราะ score กระจาย bimodal (ส่วนใหญ่ = 15 หรือ 90+)

---

## Experiment D — startNode ของ Solver (size=5, qF=1.0, default)

| startNode | Easy | Medium | Hard | avg |
|---|---|---|---|---|
| solution[0] (ตรง path) | 40% | 13% | 47% | 59 |
| [0,0] เสมอ | **100%** | 0% | 0% | 20 |

**⚠️ Critical Finding:** การให้ solver เริ่มจาก [0,0] เสมอทำให้ score = 20 ทุกด่าน
เพราะ solver ไม่ได้เริ่มจากจุดที่ path เริ่ม → เดินตาม branch ปกติได้เลย

**ข้อสรุป:** ต้องใช้ `start=solution[0]` เสมอ

---

## Experiment E — Grid Size (qF=1.0, weights=default, threshold=default)

| size | Easy | Medium | Hard | avg |
|---|---|---|---|---|
| 5×5 | 50% | 7%  | 43% | 51 |
| 6×6 | 10% | 0%  | **90%** | 89 |

**⚠️ Critical Finding:** 6×6 Hard เกือบทั้งหมด → ต้องใช้ threshold แยกกันระหว่าง 5×5 และ 6×6

---

## Experiment F — Best Config Candidates (n=50)

| config | Easy | Medium | Hard | avg |
|---|---|---|---|---|
| qF=2.0 dead=0.60 t:15/40 start=solution | 0% | 40% | 60% | 58 |
| qF=2.0 dead=0.70 t:20/50 start=[0,0] | 100% | 0% | 0% | 13 |
| qF=4.0 dead=0.50 t:30/65 start=[0,0] | 100% | 0% | 0% | 20 |
| qF=1.0 equal t:15/40 start=[0,0] | 0% | 100% | 0% | 22 |

**สรุป:** start=[0,0] ทำให้ผิดทั้งหมด — ยืนยัน Exp D

---

## ข้อสังเกตสำคัญ (Key Insights)

### 1. Score กระจายแบบ Bimodal
ด่านส่วนใหญ่ได้ score = 15 (Easy มาก) หรือ 90+ (Hard มาก)
มีด่านกลาง (Medium) น้อยมาก → สาเหตุคือ solver ฉลาดกว่า human มาก

### 2. Solver รู้ startNode = ได้เปรียบ
การให้ solver เริ่มจาก solution[0] คือ "cheating" เล็กน้อย
แต่เป็นวิธีเดียวที่ score สะท้อน difficulty จริง

### 3. 6×6 ต้องใช้ threshold แยก
- 5×5 threshold: easy<30, hard<65
- 6×6 threshold: easy<60, hard<85 (ต้องทดสอบเพิ่ม)

### 4. Branch weight สำคัญกว่า deadEnd สำหรับ 5×5
grid 5×5 มี dead-end น้อย แต่ branch points เยอะ → weight branch ควรสูงกว่าที่ออกแบบ

---

## แนวทางปรับปรุงต่อไป

- [ ] ทดสอบ threshold แยก 5×5 vs 6×6
- [ ] ทดสอบ branch weight = 0.50 ร่วมกับ qF=2.0
- [ ] พิจารณาเพิ่ม "look-ahead depth" เป็น metric ที่ 4
- [ ] Calibrate threshold จาก User Study จริง (เดือน 3)
