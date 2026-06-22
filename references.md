# References — Thesis: One-Stroke PCG with Hamiltonian Path

## หมวด 1: Hamiltonian Path & NP-Completeness

### [1] Hamilton Paths in Grid Graphs
- **Authors:** Itai, A., Papadimitriou, C., Szwarcfiter, J.
- **Year:** 1982
- **Journal:** SIAM Journal on Computing
- **URL:** https://www.researchgate.net/publication/220616693_Hamilton_Paths_in_Grid_Graphs
- **ใช้อ้างอิง:** พิสูจน์ว่า Hamiltonian Path บน Grid Graph เป็นปัญหา NP-Complete → ใช้ใน Background Theory (บทที่ 2)

### [2] Hamiltonian Paths in Two Classes of Grid Graphs
- **Year:** 2011
- **Source:** arXiv
- **URL:** https://arxiv.org/pdf/1107.1780
- **ใช้อ้างอิง:** ขยายผลการพิสูจน์ NP-Completeness ใน Grid Graph หลายรูปแบบ

### [3] A Graph Width Perspective on Partially Ordered Hamiltonian Paths
- **Year:** 2025
- **Source:** arXiv:2503.03553
- **URL:** https://arxiv.org/pdf/2503.03553
- **ใช้อ้างอิง:** งานวิจัยล่าสุดเกี่ยวกับ Hamiltonian Path บน Grid (อ้างอิงให้ธีสิสดูทันสมัย)

---

## หมวด 2: Backtracking Algorithm

### [4] Backtracking Algorithm for Hamiltonian Path Search
- **Source:** Academia.edu
- **URL:** https://www.academia.edu/87270400/Backtracking_Algorithm_for_Hamiltonian_Path_Search
- **ใช้อ้างอิง:** โครงสร้าง Backtracking Solver และวิธีนับ Dead-end → ใช้ใน Methodology (บทที่ 3)

### [5] Hamiltonian Path/Cycle — GeeksforGeeks
- **URL:** https://www.geeksforgeeks.org/dsa/hamiltonian-path-cycle-in-python/
- **ใช้อ้างอิง:** ตัวอย่าง pseudocode Backtracking (ไม่ใช่ academic paper แต่ใช้อธิบาย implementation)

---

## หมวด 3: Procedural Content Generation (PCG)

### [6] Procedural Puzzle Generation: A Survey
- **Source:** ResearchGate
- **URL:** https://www.researchgate.net/publication/333226463_Procedural_Puzzle_Generation_A_Survey
- **ใช้อ้างอิง:** ภาพรวม PCG techniques สำหรับ puzzle game, รองรับการใช้ 2D Array เป็น representation → ใช้ใน Literature Review (บทที่ 2)

### [7] Puzzle-Level Generation with Simple-Tiled and Graph-Based Wave Function Collapse Algorithms
- **Source:** ResearchGate
- **URL:** https://www.researchgate.net/publication/378377175_Puzzle-Level_Generation_with_Simple-tiled_and_Graph-based_Wave_Function_Collapse_Algorithms
- **ใช้อ้างอิง:** เปรียบเทียบวิธี PCG ต่าง ๆ สำหรับ puzzle game

### [8] Graph Grammar-Based Controllable Generation of Puzzles
- **Source:** ACM Digital Library
- **URL:** https://dl.acm.org/doi/10.1145/3102071.3102079
- **ใช้อ้างอิง:** การใช้ Graph เป็น basis ในการ generate puzzle level

### [9] Procedural Content Generation in Games: A Survey with Insights on Emerging LLM Integration
- **Year:** 2024
- **Source:** arXiv
- **URL:** https://arxiv.org/html/2410.15644v1
- **ใช้อ้างอิง:** Survey ล่าสุดของ PCG ใน game research

---

## หมวด 4: Data Structure

### [10] Graph and Its Representations — GeeksforGeeks
- **URL:** https://www.geeksforgeeks.org/dsa/graph-and-its-representations/
- **ใช้อ้างอิง:** เปรียบเทียบ Adjacency Matrix vs Adjacency List vs 2D Array → รองรับการเลือก Data Structure ใน Methodology

---

## หมวด 5: Game Design & Difficulty

### [11] Winning Snake: Design Choices in Multi-Shot ASP
- **Year:** 2024
- **Source:** arXiv:2408.08150
- **URL:** https://arxiv.org/pdf/2408.08150
- **ใช้อ้างอิง:** ตัวอย่างการใช้ path-based game กับ AI solver

---

---

## หมวด 6: Backbite Algorithm (Core PCG Algorithm)

### [12] Secondary Structures in Long Compact Polymers
- **Authors:** Oberdorf, R., Ferguson, A., Jacobsen, J. L., Kondev, J.
- **Year:** 2006
- **Journal:** Physical Review E, 74, 051801
- **ใช้อ้างอิง:** paper ต้นกำเนิดของ Backbite Move — อธิบายกลไกการสลับ edge ของ Hamiltonian Path → ใช้ใน Methodology (บทที่ 3)

### [13] Hamiltonian Path Generator (Nathan Clisby)
- **Author:** Nathan Clisby
- **Source:** clisby.net
- **URL:** https://clisby.net/projects/hamiltonian_path/
- **ใช้อ้างอิง:** Implementation อ้างอิงของ Backbite Algorithm บน n×n Grid — ใช้ประกอบการอธิบาย algorithm ใน Methodology

### [14] Reconfiguration of Hamiltonian Paths and Cycles in Rectangular Grid Graphs
- **Year:** 2025
- **Source:** arXiv:2601.06749
- **URL:** https://arxiv.org/pdf/2601.06749
- **ใช้อ้างอิง:** งานวิจัยล่าสุด (2025) เกี่ยวกับ Backbite Move บน Rectangular Grid โดยเฉพาะ — ตรงกับขอบเขตของโปรเจกต์นี้มากที่สุด

### [15] Self Avoiding Walks — DataGenetics
- **URL:** https://datagenetics.com/blog/december22018/index.html
- **ใช้อ้างอิง:** อธิบาย Backbite Algorithm แบบ visual สำหรับใช้ประกอบการอธิบายใน thesis

---

---

## หมวด 7: Difficulty Measurement & Solver Metrics

### [16] Using Search Algorithm Statistics for Assessing Maze and Puzzle Difficulty
- **Year:** 2025
- **Journal:** ScienceDirect (Entertainment Computing)
- **URL:** https://www.sciencedirect.com/science/article/pii/S1875952125000059
- **ResearchGate:** https://www.researchgate.net/publication/384602919_Using_Search_Algorithm_Statistics_for_Assessing_Maze_and_Puzzle_Difficulty
- **ใช้อ้างอิง:** พิสูจน์ว่า "nodes expanded by BFS" สัมพันธ์กับจำนวนก้าวของผู้เล่นจริง → รองรับการใช้ deadEnds + nodesVisited เป็น Deception Score ใน Methodology (บทที่ 3)
- **Key finding:** For 2D mazes, BFS nodes expanded highly correlates with human player steps

### [17] Difficulty Modelling in Mobile Puzzle Games: An Empirical Study
- **Year:** 2024
- **Source:** arXiv:2401.17436
- **URL:** https://arxiv.org/html/2401.17436v1
- **ใช้อ้างอิง:** ค่า threshold Easy/Medium/Hard — Easy=1 attempt, Hard=7+ attempts, Average=3.2 attempts → ใช้ calibrate Deception Score threshold ใน Methodology

### [18] Automated Puzzle Difficulty Estimation
- **Year:** 2016
- **Source:** ResearchGate
- **URL:** https://www.researchgate.net/publication/308837517_Automated_puzzle_difficulty_estimation
- **ใช้อ้างอิง:** วิธีการประเมิน difficulty อัตโนมัติโดยใช้ solver metrics → ใช้ใน Literature Review (บทที่ 2)

### [19] Hamiltonian Paths and Cycles in NP-Complete Puzzles
- **Authors:** Deurloo, M. et al.
- **Year:** 2024
- **Journal:** LIPIcs FUN 2024 (Leibniz International Proceedings in Informatics)
- **URL:** https://drops.dagstuhl.de/storage/00lipics/lipics-vol291-fun2024/LIPIcs.FUN.2024.11/LIPIcs.FUN.2024.11.pdf
- **ใช้อ้างอิง:** พิสูจน์ NP-Completeness ของ puzzle แนว Hamiltonian Path → ใช้ใน Background Theory (บทที่ 2)

---

*อัปเดตล่าสุด: 2026-06-16*
