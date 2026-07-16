# ⚡ Neon Math Rush

A fun, neon-themed math speed game — built to help young mathematicians (around
grade 8) get faster at mental calculations.

## 🎮 How to play

Just open **`index.html`** in any browser (laptop, tablet, or phone) — no
installs, no internet needed after loading.

1. **🎓 Practice Mode** — start here! A friendly coach walks you through the
   game with easy, untimed questions and hints. Completing it unlocks Level 1.
2. **Levels 1–10** — each level has 10 questions, a countdown timer per
   question, and 3 lives. Get 7+ correct to pass and unlock the next level.
3. **Score big** — faster answers earn more points, and correct answers in a
   row build a 🔥 streak combo that multiplies your score (up to ×4).
4. **⭐ Stars** — earn up to 3 stars per level (9/10 = ★★, perfect 10/10 = ★★★).

## 🗺️ Level map

| Level | Name | Skills |
|-------|------|--------|
| 🎓 | Practice Mode | Learn the game — untimed, unlimited lives, hints |
| 1 | Addition Sprint | 2-digit addition |
| 2 | Subtraction Zone | 2-digit subtraction |
| 3 | Times Tables | Multiplication up to 12 × 12 |
| 4 | Division Drop | Clean division facts |
| 5 | Mixed Mayhem | Add, subtract & multiply — faster timer |
| 6 | Big Multiply | 2-digit × 1-digit multiplication |
| 7 | Negative Neon | Adding, subtracting & multiplying negatives |
| 8 | Percent Power | Percentages of numbers & division |
| 9 | Square Circuit | Squares and square roots |
| 10 | Grand Neon Finale | Everything, on the fastest timer 👑 |

## ✨ Features

- Glowing neon arcade theme with animated math-symbol background and particle
  celebrations
- Works with keyboard **or** on-screen keypad (touch friendly)
- Retro arcade sound effects (generated in-browser, no audio files)
- Progress, stars, and personal bests are saved automatically in the browser
  (`localStorage`) — close the tab and pick up where you left off
- Single self-contained HTML file — zero dependencies

## 💡 Tip for parents

Progress is saved per browser. To reset the game and start fresh, open the
browser dev console on the game page and run:

```js
localStorage.removeItem('neonMathRush.v1'); location.reload();
```
