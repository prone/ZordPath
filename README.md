# ZordPath - Logic Land RPG

A children's educational RPG that teaches logic through adventure, battles, and quizzes. Built as a single-page browser game with pixel art, no dependencies.

## Play

Open `index.html` in any modern browser. No build step required.

## Features

### World & Exploration
- 15+ explorable areas: Cave, Town, Forest, Beach, Mountains, Peak Climb (5 floors), Temple of Logic (7 floors), Zord Arena
- Pixel-art overworld with NPCs, stores, building system, and fishing
- World map with area discovery tracking
- Touch controls and gamepad support for mobile/iPad

### Combat
- Action-based real-time battles with dodge, block, and attack
- Turn-based Zord battles (Pokemon-style) with element system and type advantages
- 10 elements: Fire, Ice, Nature, Shadow, Light, Arcane, Earth, Electric, Void, Water
- 50+ unique enemy types with pixel-art sprites

### Zord System
- Catch wild Zords using ZordCages (quiz question required to confirm catch)
- 3-slot bench system for Zord battles
- Zords level up via battle XP and Spa training
- Turn-based Zord battles with FIGHT/ZORD/ITEM/RUN menu

### Zord Arena
- **Arena** - Battle 4 NPC trainers with escalating difficulty
- **Hospital** - Heal all Zords for free
- **Spa** - Answer quiz questions to earn XP for bench Zords, manage bench roster

### Logic Education (11 Lessons, 4 Tiers)
| Tier | Lessons | Unlock |
|------|---------|--------|
| 1 | Propositional Basics, Truth Tables, If-Then, Equivalence, Valid Reasoning | Always |
| 2 | Predicate Logic, Logical Proofs | All Tier 1 at mastery level 1 |
| 3 | Set Theory, Boolean Algebra | All Tier 2 at mastery level 1 |
| 4 | Modal Logic, Paradoxes | All Tier 3 at mastery level 1 |

155+ multiple-choice questions plus interactive quiz types that unlock with mastery.

### Quiz Mastery System
- Per-lesson tracking with 4 mastery levels
- Level 1 unlocks: Statement Classifier, Spot the Fallacy
- Level 2 unlocks: Truth Table Fill-in, Pattern Matching
- Level 3 unlocks: Logic Builder, Logic Circuit

### Player Progression
- Player levels up from correct quiz answers (no level cap)
- Each level grants +2 HP, +1 ATK
- Save/load system with 3 slots and auto-save

### Save System
- 3 save slots stored in localStorage
- Auto-saves on area transitions, battle victories, and Zord catches
- Save slot cards on title screen showing character, level, location, play time

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| E / Space | Interact / Talk |
| I | Inventory |
| M | World Map |
| Z | ZordList |
| Q | Quiz Progress |
| H | Help |
| Esc | Close Menus |

### Battle Controls
| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Space | Attack |
| Shift | Block (with shield) |
| P | Use Potion |
| C | Throw ZordCage |
| D | Deploy Zord |

### Testing Mode
Hold `Esc + Delete/Backspace` to toggle. Saves are disabled in testing mode.
- `0+1` Add 100 rubies
- `0+2` Escape battle/quiz
- `0+3` Warp to any location
- `0+4` Add a Zord to your team

## Tech

- Pure HTML/CSS/JS, no frameworks or build tools
- Canvas-based rendering with pixel art
- Web Audio API for sound effects
- localStorage for saves and stats
- ~13,600 lines of code across 3 files
