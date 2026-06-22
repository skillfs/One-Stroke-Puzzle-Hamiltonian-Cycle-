const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, font: "TH Sarabun New" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 28, font: "TH Sarabun New" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 24, font: "TH Sarabun New", ...opts })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 24, font: "TH Sarabun New" })]
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: i === 0 ? 4000 : 5360, type: WidthType.DXA },
      shading: isHeader ? { fill: "2E75B6", type: ShadingType.CLEAR } : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({
          text,
          size: 22,
          font: "TH Sarabun New",
          bold: isHeader,
          color: isHeader ? "FFFFFF" : "000000"
        })]
      })]
    }))
  });
}

function makeTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4000, 5360],
    rows
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "TH Sarabun New", size: 24 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "TH Sarabun New", color: "2E75B6" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "TH Sarabun New", color: "1F4E79" },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
            children: [new TextRun({ text: "Thesis Proposal — Undergraduate CS", size: 20, font: "TH Sarabun New", color: "666666" })]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "หน้า ", size: 20, font: "TH Sarabun New", color: "666666" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "TH Sarabun New", color: "666666" })
            ]
          })
        ]
      })
    },
    children: [
      // Title block
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 120 },
        children: [new TextRun({ text: "Thesis Proposal", size: 48, bold: true, font: "TH Sarabun New", color: "2E75B6" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "วิทยาการคอมพิวเตอร์ — ระดับปริญญาตรี", size: 28, font: "TH Sarabun New", color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [new TextRun({ text: "ระยะเวลาดำเนินการ: 4 เดือน", size: 24, font: "TH Sarabun New", color: "888888" })]
      }),

      // Section 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. ชื่อหัวข้อ", font: "TH Sarabun New" })] }),
      p("ภาษาไทย:", { bold: true }),
      p("การพัฒนาระบบสร้างด่านเกม One-Stroke อัตโนมัติโดยใช้อัลกอริทึม Hamiltonian Path ร่วมกับการประเมินความยากเชิงรู้คิด"),
      new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),
      p("ภาษาอังกฤษ:", { bold: true }),
      p("Procedural Level Generation for One-Stroke Puzzle Games Using Hamiltonian Path Algorithm with Cognitive Difficulty Evaluation"),

      // Section 2
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. ที่มาและปัญหา", font: "TH Sarabun New" })] }),
      p("เกมประเภท One-Stroke (ลากเส้นผ่านทุก block เพียงครั้งเดียว) เป็นที่นิยมสูงในตลาด Mobile และ Web แต่มีข้อจำกัดสำคัญ 2 ประการ:"),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "ปัญหาที่ 1 — ด่านมีจำนวนจำกัด", font: "TH Sarabun New" })] }),
      p("เกมในตลาดปัจจุบันต้องให้ทีม Designer สร้างด่านเองทีละด่าน ส่งผลให้เนื้อหาหมดเร็ว ผู้เล่นหยุดเล่น"),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "ปัญหาที่ 2 — ระบบ AI สร้างด่านที่มีอยู่ \"ง่ายเกินไป\"", font: "TH Sarabun New" })] }),
      p("เมื่อใช้อัลกอริทึมทั่วไปสร้างด่านอัตโนมัติ การเพิ่มขนาด Grid ทำให้ด่านดูซับซ้อนขึ้นในเชิงภาพ แต่ความยากเชิงความคิด (Cognitive Complexity) ไม่ได้เพิ่มขึ้นจริง"),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        shading: { fill: "EBF3FB", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "Research Gap: ยังไม่มีระบบที่วัดและควบคุม Cognitive Difficulty ของด่าน One-Stroke ได้อย่างเป็นระบบ", size: 24, font: "TH Sarabun New", bold: true, color: "1F4E79" })]
      }),

      // Section 3
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. วัตถุประสงค์การวิจัย", font: "TH Sarabun New" })] }),
      bullet("พัฒนาระบบสร้างด่าน One-Stroke อัตโนมัติที่รับประกันว่าทุกด่านมีคำตอบที่ถูกต้อง"),
      bullet("ออกแบบ Deception Score สำหรับวัด Cognitive Difficulty โดยไม่อิงขนาด Grid"),
      bullet("พิสูจน์ว่า Deception Score สอดคล้องกับพฤติกรรมผู้เล่นจริง"),

      // Section 4
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. ขอบเขตการวิจัย", font: "TH Sarabun New" })] }),
      bullet("ตัวเกมรันบนเว็บ (Web Browser) พัฒนาด้วย TypeScript + Phaser 3"),
      bullet("Grid ขนาดคงที่ที่ 5x5 และ 6x6 เท่านั้น"),
      bullet("กลุ่มตัวอย่าง: นักศึกษาระดับอุดมศึกษา จำนวน 30 คน"),
      bullet("ไม่รวม Adaptive Difficulty แบบ Real-time (เก็บไว้เป็น Future Work)"),

      // Section 5
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. ทฤษฎีและแนวคิดหลัก", font: "TH Sarabun New" })] }),
      p("เบื้องหลังทางคณิตศาสตร์ของเกม One-Stroke คือปัญหา Hamiltonian Path บน Grid Graph ซึ่งพิสูจน์แล้วว่าเป็นปัญหาระดับ NP-Complete (Itai et al., 1982) หมายความว่ายิ่ง Graph ซับซ้อน การหาคำตอบยิ่งใช้เวลาเพิ่มขึ้นแบบ Exponential"),
      new Paragraph({ spacing: { before: 120, after: 80 }, children: [] }),
      p("อัลกอริทึมหลักที่ใช้มี 2 ตัว:", { bold: true }),
      new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }),
      makeTable([
        tableRow(["อัลกอริทึม", "หน้าที่"], true),
        tableRow(["Backbite Algorithm", "สร้าง Hamiltonian Path แบบสุ่มที่มีความหลากหลายสูง"]),
        tableRow(["Backtracking Solver", "จำลองการแก้ด่าน นับ Dead-end หลอก เพื่อคำนวณ Deception Score"])
      ]),

      // Section 6
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360 }, children: [new TextRun({ text: "6. วิธีดำเนินการวิจัย", font: "TH Sarabun New" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "เดือนที่ 1 — Core Game + ศึกษา Algorithm", font: "TH Sarabun New" })] }),
      bullet("ศึกษา Backbite Algorithm และ Backtracking Search"),
      bullet("สร้างตัวเกม One-Stroke พื้นฐาน: Grid, ลากเส้น, ตรวจสอบการผ่านด่าน"),
      bullet("สร้างด่านตัวอย่างแบบ Manual เพื่อทดสอบระบบเกม"),
      p("Output: ตัวเกมที่เล่นได้ รัน Local ได้", { bold: true, color: "2E75B6" }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "เดือนที่ 2 — PCG Module + Difficulty Evaluator", font: "TH Sarabun New" })] }),
      bullet("เขียน Backbite Algorithm สร้าง Hamiltonian Path แบบสุ่ม"),
      bullet("เพิ่ม Deceptive Edges รอบเส้นทางหลักเพื่อสร้างทางหลอก"),
      bullet("เขียน Backtracking Solver Bot จำลองการเล่น"),
      bullet("คำนวณ Deception Score จากจำนวน Dead-end และ Branching Points"),
      bullet("แบ่ง Score เป็น 3 ระดับ: Easy / Medium / Hard"),
      p("Output: ระบบสร้างด่านอัตโนมัติ + ให้คะแนนความยากได้", { bold: true, color: "2E75B6" }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "เดือนที่ 3 — User Study + วิเคราะห์ผล", font: "TH Sarabun New" })] }),
      bullet("Deploy เกมขึ้น Web (Vercel หรือ GitHub Pages) ส่ง Link ให้กลุ่มตัวอย่าง"),
      bullet("ให้นักศึกษา 30 คน เล่นด่านที่ระบบสุ่มให้ (Easy / Medium / Hard คละกัน)"),
      bullet("เก็บข้อมูล: เวลาที่ใช้ต่อด่าน, จำนวนครั้งที่เล่นผิด, อัตราสำเร็จ"),
      bullet("วิเคราะห์ด้วย t-test ว่า Deception Score สูง -> ผู้เล่นใช้เวลานานขึ้นจริงไหม"),
      p("Output: ตาราง กราฟ และผลสถิติ", { bold: true, color: "2E75B6" }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "เดือนที่ 4 — เขียนเล่มวิทยานิพนธ์", font: "TH Sarabun New" })] }),
      bullet("เขียนบทที่ 1-5 ให้ครบ"),
      bullet("สรุป Contribution และ Future Work"),
      bullet("ตรวจสอบกับอาจารย์ที่ปรึกษา แก้ไข และ Submit"),
      p("Output: เล่มวิทยานิพนธ์ฉบับสมบูรณ์", { bold: true, color: "2E75B6" }),

      // Section 7
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "7. สิ่งที่ส่งมอบ (Deliverables)", font: "TH Sarabun New" })] }),
      bullet("ตัวเกม One-Stroke รันบนเว็บ"),
      bullet("PCG Module — สร้างด่านอัตโนมัติด้วย Backbite Algorithm"),
      bullet("Difficulty Evaluator — คำนวณ Deception Score ด้วย Backtracking Solver"),
      bullet("ผลการทดลอง — กราฟและสถิติเปรียบเทียบ Score vs พฤติกรรมผู้เล่น"),
      bullet("เล่มวิทยานิพนธ์"),

      // Section 8
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "8. เหตุผลที่หัวข้อนี้เหมาะกับ ป.ตรี CS", font: "TH Sarabun New" })] }),
      makeTable([
        tableRow(["ประเด็น", "คำตอบ"], true),
        tableRow(["มีทฤษฎีรองรับไหม?", "✅ Graph Theory, NP-Completeness, Backtracking"]),
        tableRow(["วัดผลได้เป็นตัวเลขไหม?", "✅ Deception Score, เวลาผู้เล่น, t-test"]),
        tableRow(["ทำคนเดียวเสร็จใน 4 เดือนไหม?", "✅ Scope จำกัด, Grid ขนาดคงที่, ไม่มีระบบ Server ซับซ้อน"]),
        tableRow(["ต่างจากเกมในตลาดอย่างไร?", "✅ แก้ปัญหา Difficulty ที่ระบบ PCG ทั่วไปยังทำไม่ได้"]),
        tableRow(["ขยายต่อได้ในอนาคตไหม?", "✅ เพิ่ม Adaptive Difficulty, Mechanic ใหม่"])
      ]),

      // Section 9
      new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360 }, children: [new TextRun({ text: "9. References", font: "TH Sarabun New" })] }),
      p("1. Itai, A., Papadimitriou, C., Szwarcfiter, J. (1982). Hamilton Paths in Grid Graphs. SIAM Journal on Computing."),
      p("2. Shaker, N., Togelius, J., Nelson, M. (2016). Procedural Content Generation in Games. Springer. (open access)"),
      p("3. Smith, G., Whitehead, J. (2010). Analyzing the Expressive Range of a Level Generator. PCG Workshop.")
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("D:\\Thesis\\Thesis_Proposal.docx", buffer);
  console.log("Done: D:\\Thesis\\Thesis_Proposal.docx");
});
