// ====================================================
//  แก้ค่าตรงนี้เพื่อปรับ UI / gameplay ได้ทันที
//  ดู Design.md สำหรับระบบออกแบบทั้งหมด
// ====================================================
import Phaser from 'phaser';

export const GAME = {
  width: 480,
  height: 640,
  backgroundColor: 0x1a1a2e,
};

// สีหลักของเกม — แก้ที่นี่จุดเดียว (ดู Design.md §3)
export const COLORS = {
  primary:    0x534AB7,   // สีเส้นทาง / path / ปุ่มหลัก
  secondary:  0x5DCAA5,   // ด่านที่ผ่านแล้ว
  endpoint:   0xD85A30,   // จุดเริ่มต้น
  empty:      0x2a2a4e,   // ช่องว่าง / ปุ่มรอง
  bg:         0x1a1a2e,   // พื้นหลัง
  bgPanel:    0x16162a,   // ช่องที่ถูก lock
  text:       0xffffff,
  textMuted:  0x888888,
  textDisabled: 0x444444,
  gold:       0xEF9F27,   // คะแนน / highlight
};

// สีแบบ string (#rrggbb) สำหรับ text style — ดู Design.md §3
export const HEX = {
  text:        '#ffffff',
  textMuted:   '#888888',
  textDisabled:'#444444',
  primary:     '#7F77DD',
  secondary:   '#5DCAA5',
  gold:        '#EF9F27',
  bgDark:      '#1a1a2e',
};

// ระยะห่าง — ฐาน 8px (ดู Design.md §5)
export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

// ตัวอักษร (ดู Design.md §4)
export const TYPO = {
  family: "'Sarabun', 'Segoe UI', sans-serif",
  display: 42,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  label: 14,
  caption: 12,
};

// Layout — พิกัด/ขนาดกลาง (ดู Design.md §2, §6, §7)
export const LAYOUT = {
  centerX: GAME.width / 2,   // 240
  centerY: GAME.height / 2,  // 320
  safeMargin: 24,
  button: { width: 220, height: 48, gap: SPACING.md }, // center-to-center = 64
  tab:    { width: 116, height: 40, gap: SPACING.sm },
  levelCell: { size: 70, gap: SPACING.sm, cols: 5 },
};

// helper: สร้าง text style จาก token — ใช้แทนการพิมพ์ fontSize เอง
export function textStyle(
  size: number,
  color: string = HEX.text,
  bold = false
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: TYPO.family,
    fontSize: `${size}px`,
    color,
    fontStyle: bold ? 'bold' : 'normal',
  };
}

// สไตล์ช่อง grid
export const CELL = {
  gap: 4,           // ช่องว่างระหว่างช่อง (px)
  cornerRadius: 8,  // ความโค้งมุม (px)
  borderWidth: 0,   // ขอบ (0 = ไม่มี)
};

// จำนวนด่านแต่ละความยาก
export const LEVELS = {
  easy:   20,
  medium: 20,
  hard:   20,
};

// ขนาด grid แต่ละ difficulty
export const GRID_SIZE = {
  easy:   5,
  medium: 7,
  hard:   9,
};

// คะแนน Endless Mode
export const SCORING = {
  basePerLevel:   100,  // คะแนนพื้นฐานต่อด่าน
  efficiencyBonus: 50,  // bonus ถ้าใช้ moves = optimal
  noHintMultiplier: 1.5, // x1.5 ถ้าไม่ใช้ hint
  streakBonus:    10,   // bonus ต่อ streak
};
