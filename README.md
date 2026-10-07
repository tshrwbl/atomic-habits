# Atomic Habits — PWA Web App with 1% Betterment Engine

[![Deploy to GitHub Pages](https://github.com/tshrwbl/atomic-habits/actions/workflows/deploy.yml/badge.svg)](https://github.com/tshrwbl/atomic-habits/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=flat&logo=github)](https://tshrwbl.github.io/atomic-habits/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue?style=flat&logo=pwa)](https://tshrwbl.github.io/atomic-habits/)

> 🌐 **Live Demo & Shareable Web App**: [https://tshrwbl.github.io/atomic-habits/](https://tshrwbl.github.io/atomic-habits/)
>
> 📱 **Install on Mobile**: Open the link in Safari (iOS) and tap **Share &rarr; Add to Home Screen**, or Chrome (Android) and tap **Add to Home screen** / **Install App**.

A modern, responsive, installable Progressive Web App (PWA) built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**, designed faithfully around James Clear's bestselling book ***Atomic Habits***.

---

## ⚡ Core Atomic Habits Principles Built-In

1. **Identity-Based Habits ("Who do you want to become?")**
   - Every habit is tied to an identity (e.g. *"Lifelong Learner"*, *"Energized Athlete"*, *"Mindful Thinker"*).
   - Every completion casts a tangible **vote** for that identity, tracking evidence progression.

2. **The 4 Laws of Behavior Change**:
   - **1st Law (Make it Obvious)**: Habit Stacking formula: *"After [CURRENT HABIT], I will [NEW HABIT]"*.
   - **2nd Law (Make it Attractive)**: Temptation bundling and instant enjoyment pairings.
   - **3rd Law (Make it Easy)**: **The 2-Minute Rule** downscaled versions for low-energy days.
   - **4th Law (Make it Satisfying)**: Instant visual streaks, milestone confetti celebrations, and identity reinforcement.

3. **The Golden Rule: Never Miss Twice**
   - Automatically flags habits missed yesterday with a rescue alert to safeguard your momentum before slipping.

4. **🚀 1% Betterment Engine for Habits (New!)**
   - Attach a progressive overload engine to measurable habits.
   - **Customizable Compounding Cadence**:
     - **Daily**: $+1\%$ improvement per day &rarr; $1.01^{365} = 37.78\text{x}$ gain in 1 year (great for pages read, pushup reps, small wins).
     - **Weekly**: $+1\%$ improvement per week &rarr; $1.01^{52} = 1.68\text{x}$ gain in 1 year (great for workout duration, words written, meditation).
     - **Monthly**: $+1\%$ improvement per month &rarr; $1.01^{12} = 1.13\text{x}$ gain in 1 year (great for deep work sprint blocks, complex skill milestones).
   - **Automatic Compounded Target Calculation**: Computes today's exact target from your baseline and time elapsed.
   - **Output Logging & Tracking**: Log actual quantities, track percent growth achieved, and view projected milestones.

5. **📤 Shareable Habits with JSON Import / Export (New!)**
   - **Share Habit Routines**: Export clean habit packs (strips personal completion history while preserving identities, habit stacks, 2-minute rules, and 1% betterment engines) to share with friends, colleagues, or teams.
   - **One-Click Copy to Clipboard**: Instantly copies formatted JSON without needing file downloads—perfect for quick sharing via chat, WhatsApp, or Slack.
   - **Full JSON Backup & Restore**: Export full data backups including complete streaks and milestone histories for seamless device switching.
   - **Smart JSON Importer**:
     - Drag-and-drop or select any `.json` file.
     - Paste JSON text directly in-browser.
     - **Merge Mode** (adds new habits alongside existing ones with unique IDs) vs. **Replace Mode** (clean restore).
     - Live syntax validation and habit count preview before importing.

6. **1% Better Every Day Compounding Dashboard**
   - Interactive compounding curve demonstrating $1.01^{365} = 37.78\text{x}$ vs $0.99^{365} = 0.03$.
   - Live 7-day consistency rate, streak metrics, and total identity votes.

7. **The Habit Scorecard (Awareness Tool)**
   - Score automatic daily routines with `+` (positive), `-` (negative), or `=` (neutral) before modifying them.
   - 1-click conversion from effective routine items into tracked habits.

8. **Curated James Clear Habit Templates**
   - Pre-configured habit stacks ready to adopt in one click.

---

## 📱 Installing on Mobile as a PWA

The app is fully configured as an installable Progressive Web App with offline caching, high-resolution app icons, and a standalone app window.

### On Android (Chrome / Brave / Edge):
1. Connect your phone to the same Wi-Fi network or deploy online.
2. Open the network URL (e.g. `http://192.168.1.3:5173/` or your production domain).
3. Tap the **"Install App"** banner at the top, or tap the three dots **(⋮)** &rarr; **"Add to Home Screen"** / **"Install app"**.
4. The Atomic Habits icon will appear on your home screen and app drawer, launching in full screen without browser bars.

### On iOS (Safari):
1. Open the URL in Safari on your iPhone or iPad.
2. Tap the **Share** button (box with an arrow pointing up at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.

---

## 🛠️ Local Development & Scripts

- **Development server** (with network access for mobile testing):
  ```bash
  npm run dev
  ```
- **Production build** (generates PWA bundle, service worker & manifest in `/dist`):
  ```bash
  npm run build
  ```
- **Preview production build**:
  ```bash
  npm run preview
  ```
