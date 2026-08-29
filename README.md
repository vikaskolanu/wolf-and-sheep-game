# 🐺 Ecosystem Reserve — Predator vs Prey Simulation Game

An interactive, grid-based ecosystem placement puzzle and simulation game built with **React**, **TypeScript**, and **Tailwind CSS**.

---

## 🌿 Core Mechanics & Rules

1. **Universal 1-Animal-Per-Cell**:
   - Each cell can contain at most **1 animal** (either 1 sheep OR 1 wolf).
   - Placement phase prevents overcrowding.

2. **Wolf Hunting & Starvation**:
   - Each alive wolf hunts the closest alive sheep *not already targeted by another wolf*.
   - When a wolf reaches a sheep's cell, the sheep is eaten immediately, leaving only the wolf.
   - If a wolf does not eat for 3 consecutive weeks, it starves and perishes.
   - Wolves avoid moving into cells occupied by other wolves.

3. **Sheep Grazing & Reproduction**:
   - Sheep feed on **grass patches** and stay nourished.
   - While on grasslands, sheep reproduce into adjacent empty cells (prioritizing empty grass first, then empty land).
   - If a sheep reproduces into an adjacent cell occupied by a wolf, the wolf eats the newborn sheep on the spot, resetting its hunger timer and staying in place without moving.
   - Any sheep located on barren land outside grasslands survives for **only 1 week** before starving.

4. **Levels & Victory Condition**:
   - 6 progressive campaign levels with escalating difficulties and survival deadlines (up to 30-week challenges).
   - Goal: Maintain species balance until the final week without extinction or collapse.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Build
```bash
npm run build
```

---
