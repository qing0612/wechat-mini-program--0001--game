---
name: "campus-miniprogram-dev"
description: "Guides development on the 河北师范大学 pixel-art campus exploration WeChat mini-program. Invoke when modifying code, fixing bugs, or adding features to this specific mini-program."
---

# 河北师范大学校园像素风漫游小程序 · 开发指南

> **⚠️ MANDATORY: Read `DEVELOPER_RULES.md` in the project root before making ANY code changes. That file documents every historical pitfall, design decision, and rule derived from actual bugs.**

---

## Project Overview

A pixel-art style campus exploration WeChat mini-program for 河北师范大学 (Hebei Normal University). Users navigate a top-down 2D map with a virtual joystick, explore 6 buildings, collect badges, and explore campus culture. Built as a WeChat mini-program with Canvas rendering.

**Architecture**: 7 pages in a single main package (no subpackages), Canvas-based rendering, singleton state management, optional cloud sync, unified logging.

**Key user flows**:
- Start page → New game / Continue game
- Map page → Joystick movement → Building bubble → Building detail
- Building detail → View image + history + Collect badge → Back to map
- Sports field → Independent canvas map → Back to main map
- Settings → Day/night toggle, seasons, cloud sync, privacy policy access
- Backpack → Collected badges view

---

## 🔴 Critical: Read DEVELOPER_RULES.md First

**Before changing ANY code**, read `DEVELOPER_RULES.md` in the project root. It documents every historical pitfall, design decision, and rule derived from actual bugs. If a conflict exists between this SKILL.md and DEVELOPER_RULES.md, DEVELOPER_RULES.md takes priority.

---

## Project Structure

```
小程序/
├─ app.json / app.js / app.wxss        # Global config, cloud init, privacy, error handlers
├─ project.config.json                 # Dev tool settings + __usePrivacyCheck__
│
├─ pages/
│  ├─ start/                           # Landing page: "进入校园" + "新建游戏"
│  ├─ map/                             # Main map: Canvas + joystick + building bubbles
│  ├─ building/                        # Building detail: image + history + badge
│  ├─ sports/                          # Sports field: independent canvas map
│  ├─ settings/                        # Settings: day/night, seasons, cloud sync, privacy
│  ├─ backpack/                        # Backpack: 16-grid items + badge gallery
│  └─ privacy/                         # Privacy policy + user agreement text page
│
├─ data/
│  ├─ buildings.js                     # 6 buildings config: triggerZone, collisionZone, badge
│  └─ buildingHistory.js               # History text content keyed by building id
│
├─ config/
│  └─ gameConfig.js                    # Game params: speed, spawn points, map sizes
│
├─ services/
│  └─ buildingService.js               # Building lookup and trigger detection
│
├─ store/
│  └─ gameStore.js                     # ★ Singleton state: local storage, cloud sync, stats
│
├─ utils/
│  ├─ joystick.js                      # Virtual joystick: touch → normalized direction
│  ├─ camera.js                        # Camera: world coords ↔ screen coords
│  ├─ collision.js                     # AABB collision detection
│  ├─ sprite.js                        # Pixel-art player sprite drawing
│  ├─ weatherEffect.js                 # Particle effects: snow/rain
│  ├─ audioManager.js                  # Audio: single instance, per-page music, volume persist
│  ├─ cloudSync.js                     # ★ Optional cloud sync (disabled by default)
│  └─ logger.js                        # ★ Unified logging: WeChat realtime log integration
│
├─ images/
│  ├─ map-bg.png / start-bg.png        # Main map background / start page background
│  ├─ buildings/                       # 5 interior illustrations (all PNG)
│  ├─ badges/                          # 5 badge icons (all PNG)
│  └─ map/sports-bg.png                # Sports field background
│
├─ audio/
│  ├─ bgm.mp3                          # Start page / general background music
│  └─ bgm2.mp3                         # Map page music
│
├─ sitemap.json                        # Search engine index config
├─ DEVELOPER_RULES.md                  # ★ Historical pitfalls & rules (MUST READ)
├─ GUIDE.md                            # Developer guide for adding buildings/features
└─ README.md                           # Project overview and quick start
```

---

## Configuration Rules (Non-Negotiable)

### app.json — Current State & Rules

| Field | Current Value | Rule |
|-------|--------------|------|
| `pages` | 7 pages (start, map, building, sports, settings, backpack, privacy) | Always register new pages here; NEVER use `subPackages` |
| `requiredPrivateInfos` | `[]` (empty array) | No sensitive permissions needed; DO NOT add entries |
| `lazyCodeLoading` | `"requiredComponents"` | Keep as-is |
| `__usePrivacyCheck__` | **NOT present** | This switch belongs in `project.config.json` ONLY; adding here causes `backgroundfetch privacy fail` errors |
| `webp` | **NOT present** | All images are PNG; never add `"webp": true` |
| `subPackages` | **NOT present** | Causes mobile-side image loading failures; NEVER add |
| `window` | Standard navigation config | Keep unchanged unless user explicitly requests |

### project.config.json — Key Settings

| Field | Current Value | Rule |
|-------|--------------|------|
| `setting.__usePrivacyCheck__` | `true` | The ONLY place this switch should exist. Enables privacy authorization flow. |
| `libVersion` | `"3.15.2"` | Do not downgrade below 3.0.0 (needed for current APIs) |
| `appid` | `"wxe2a67cb24507dd31"` | Do NOT replace; this is the project's registered appid |
| `compileType` | `"miniprogram"` | Not a game; normal mini-program class |
| `packOptions.ignore` | Dev files excluded | Keeps package size down |
| `project.private.config.json` | Also needs `__usePrivacyCheck__: true` | Dev environment mirror |

### Image Format: PNG Only (Verified)

- **All images are `.png`** — confirmed by directory listing; NOT WebP, NOT JPG
- Image paths start with `/` like `/images/buildings/library.png`
- Never use relative paths like `images/buildings/library.png`
- **Do NOT add `webp="{{true}}"` to `<image>` tags** — unnecessary for PNG files
- **Do NOT add `"webp": true` to `app.json`** — not needed, historical: caused issues

**Image directory contents**:
```
images/
├─ map-bg.png                    # Main map background (top-down pixel-art)
├─ start-bg.png                  # Start page background (campus gate)
├─ buildings/
│  ├─ library.png                # Library interior
│  ├─ museum.png                 # Museum interior
│  ├─ software.png               # Software college interior
│  ├─ pont.png                   # Overpass/campus landmark interior
│  └─ lecture.png                # Lecture hall interior
├─ badges/
│  ├─ library-badge.png          # Badge icon for visiting library
│  ├─ museum-badge.png           # Badge icon for visiting museum
│  ├─ software-badge.png         # Badge icon for visiting software college
│  ├─ pont-badge.png             # Badge icon for visiting pont landmark
│  └─ lecture-badge.png          # Badge icon for visiting lecture hall
└─ map/
   └─ sports-bg.png              # Sports field background (independent map)
```

### Building Count Note

- `data/buildings.js` defines 6 buildings (library, museum, software, pont, lecture, sportsfield)
- But images/ folder has 5 building images and 5 badge images — sportsfield uses the map/sports-bg.png instead of a separate building image
- Sports field has `isSportsField: true` and routes to `pages/sports/sports` page instead of `pages/building/building`

---

## Architecture & Code Organization

### Key Files and Their Relationships

| File | Purpose | Related Files |
|------|---------|---------------|
| `store/gameStore.js` | State management: singleton store, subscribers, local storage, optional cloud sync, achievement stats | `pages/start/start.js` (resetGame), `pages/settings/settings.js` (read stats), `pages/building/building.js` (add badge), `utils/cloudSync.js`, `utils/logger.js` |
| `data/buildings.js` | Building configuration: 6 buildings with triggerZone, collisionZone, badge info | `data/buildingHistory.js` (text content), `services/buildingService.js`, `pages/map/map.js`, `pages/building/building.js` |
| `data/buildingHistory.js` | Historical text content for each building, keyed by building id | Referenced by `data/buildings.js` via `HISTORY_TEXTS.<building_id>` |
| `config/gameConfig.js` | Game parameters: player speed, spawn points, map sizes, animation settings | `store/gameStore.js`, `pages/map/map.js`, `pages/sports/sports.js` |
| `app.js` | Global init: cloud dev init, privacy check, error handlers, logger integration | `app.json`, `project.config.json`, `utils/cloudSync.js`, `utils/logger.js` |
| `pages/map/map.js` | Main map: Canvas rendering, joystick, building detection bubbles | `store/gameStore.js`, `utils/joystick.js`, `utils/camera.js`, `utils/collision.js`, `utils/sprite.js`, `services/buildingService.js` |
| `pages/sports/sports.js` | Sports field: Separate Canvas, independent map coords | `store/gameStore.js`, `config/gameConfig.js` (sports map size) |
| `pages/building/building.js` | Building detail: Shows interior image, history text, badge collection | `data/buildings.js`, `data/buildingHistory.js`, `store/gameStore.js` |
| `pages/settings/settings.js` | Settings: Day/night toggle, seasons, cloud sync button, privacy policy link, stats display | `store/gameStore.js`, `pages/privacy/privacy.js`, `utils/cloudSync.js` |
| `pages/start/start.js` | Start page: "进入校园" button, "新建游戏" button | `store/gameStore.js` (resetGame for new game) |
| `pages/backpack/backpack.js` | Inventory: 16-grid display, badge gallery | `store/gameStore.js` (backpack array) |
| `pages/privacy/privacy.js` | Privacy policy + user agreement text page | Linked from `pages/settings/settings.js` |
| `utils/logger.js` | Unified logging with WeChat realtime log manager | `app.js` (global onError/onUnhandledRejection), `store/gameStore.js`, `pages/*/*.js` |
| `utils/cloudSync.js` | Optional cloud sync: user_saves collection, dynamic availability check | `app.js` (CLOUD_ENV + cloudReady flag), `store/gameStore.js` (_persist → persistence.save) |
| `services/buildingService.js` | Building lookup: find building by id, detect when player enters trigger zone | `data/buildings.js`, `pages/map/map.js` |

### Data Consistency: Single Source of Truth (CRITICAL)

**This is the #1 historical source of bugs. Never violate these rules.**

| Data Point | Source of Truth | Auto-synced Fields | Notes |
|-----------|-----------------|-------------------|-------|
| Buildings visited | `backpack.count()` | `stats.syncFromBackpack(backpack.count())` in addToBackpack/removeFromBackpack/setCurrentBuilding/forceSyncToCloud/_applySnapshot | EQUAL to badge count. Visiting a building grants exactly one badge. |
| Badges collected | `backpack.count()` | Same sync as buildings visited | EQUAL to building count. Each building grants one badge. |
| Total steps | `stats.totalSteps` (read-only) | `stats.stepOnce()` auto-increments on each player move | Incremented by 1 each `updatePlayerPos()` call. Reset to 0 in `resetGame()` and `setSaveOnQuit(false)`. |
| Player position | `player.x`, `player.y` | Written on each move | Persisted via `_snapshot()` → `persistence.save()`. Reset to spawn in `resetGame()`. |
| Sports field position | `sportsPlayer.x`, `sportsPlayer.y` | Separate from main map | Independent coordinate store for sports page. |
| Backpack items | `backpack.snapshot()` | Array of item objects. Each badge is one entry. | `backpack.count()` is the length. |
| Day/night | `isDay` | Boolean flag | Toggle in settings. |
| Season | `season` | String: `"spring"`, `"summer"`, `"autumn"`, `"winter"` | Toggle in settings. |
| Save-enabled | `saveOnQuit` | Boolean flag | `false` = no persistence, `stats.reset()`. |

**CRITICAL RULE**: Never maintain `visitedBuildingIds` or any separate counter. This field was removed after causing data inconsistency bugs. All building/badge counts are derived from `backpack.count()`.

**Backpack-stats sync is embedded in mutation APIs**, NOT done in a separate `_save()`/`_restore()` step:
- `addToBackpack(item)` → calls `stats.syncFromBackpack(backpack.count())`
- `removeFromBackpack(id)` → calls `stats.syncFromBackpack(backpack.count())`
- `setCurrentBuilding(idOrBuilding)` → calls `stats.syncFromBackpack(backpack.count())`
- `forceSyncToCloud()` → calls `stats.syncFromBackpack(backpack.count())`
- `_applySnapshot(data)` → calls `stats.syncFromBackpack(backpack.count())`

### State Management (gameStore — Modular Architecture)

**Pattern**: Singleton with subscriber pattern. One global instance shared across all pages. Backed by sub-modules.

```javascript
// In any page file:
const gameStore = require('../../store/gameStore.js');

// Subscribe to changes (typically in page onLoad):
this.unsubscribe = gameStore.subscribe(() => {
  const state = gameStore.getState();
  this.setData({ /* update from state */ });
});

// Unsubscribe (typically in page onUnload):
onUnload() {
  if (this.unsubscribe) this.unsubscribe();
}

// Reading state:
const state = gameStore.getState();
console.log(state.backpack.length);   // badges/buildings count
console.log(state.stats.totalSteps);  // total steps

// Reset game (start fresh):
gameStore.resetGame();  // Resets EVERYTHING including totalSteps, player position, backpack, badges
```

**gameStore sub-modules** (in `store/`):
- `backpack.js` — badge/item collection (`add` / `remove` / `has` / `count` / `snapshot` / `load`)
- `stats.js` — steps & badge counts (`stepOnce` / `syncFromBackpack` / `load` / `reset`, read via getters)
- `persistence.js` — local storage + cloud sync encapsulation (`saveLocal` / `loadLocal` / `clearLocal` / `save` / `syncToCloud` / `forceSyncToCloud` / `loadFromCloud`, cloud provider injected via `setCloudProvider`)

**When adding a new state field**, you must update ALL of:
1. `gameStore` constructor — field initialization
2. `setState(partial)` — merge logic
3. `getState()` — return snapshot
4. `_snapshot()` — build persistence object
5. `_applySnapshot(data)` — restore from saved data
6. `resetGame()` — reset to fresh defaults (if applicable)
7. Optional: `addToBackpack` / `removeFromBackpack` / `setCurrentBuilding` / `forceSyncToCloud` if it affects stats consistency

**What `resetGame()` does** (never manually setState for this):
- Player position → `PLAYER.SPAWN_X`, `PLAYER.SPAWN_Y`
- Player direction → `"down"`
- Backpack → `[]` (empty)
- Stats: `totalSteps → 0`, `buildingsVisited → 0`, `badgesCollected → 0`
- Day/night → `true` (day)
- Season → `"spring"`

**Persistence flow**: `notify()` → `_persist()` → `persistence.save(snapshot)` → `wx.setStorageSync('game_state')`. The key is always `'game_state'`.

**Safety mechanism**: The entire `GameStore` constructor is wrapped in a try-catch block that falls back to a minimal valid state. This prevents black screens from corrupted storage data.

---

## Cloud Sync System (Optional, Disabled by Default)

This is a **progressive enhancement** — the app works perfectly without cloud sync. When configured, it enables cross-device progress synchronization.

### How It Works (3-Layer Architecture)

**Layer 1 — `app.js` (Configuration Gate)**
```javascript
// Near the top of app.js
const CLOUD_ENV = '';  // ← User fills this with their cloud env ID to enable

// If filled:
wx.cloud.init({ env: CLOUD_ENV, traceUser: true });
app.globalData.cloudReady = true;

// If empty:
// wx.cloud.init is NOT called
// app.globalData.cloudReady = false
// All cloud code auto-skips
```

**Layer 2 — `utils/cloudSync.js` (Dynamic Availability Check)**
```javascript
// available() is called EVERY TIME before any cloud operation
// It dynamically checks app.globalData.cloudReady
// This means: if CLOUD_ENV is empty, available() always returns false

available() {
  const app = getApp();
  if (!app || !app.globalData || !app.globalData.cloudReady) return false;
  if (!wx.cloud) return false;
  return true;
}

// All database operations are wrapped in try-catch
// Failures are SILENT — they never break the UI
```

**Layer 3 — `store/gameStore.js` (Conditional Invocation)**
```javascript
// In _persist() — local save always runs; cloud sync is optional
try {
  wx.setStorageSync('game_state', JSON.stringify({ ... }));  // Always runs
} catch (e) { /* log */ }

if (cloudSync.available()) {          // Check before ANY cloud call
  cloudSync.syncToCloud({ ... });     // Async, debounced
}

// In constructor — optional cloud load for cross-device sync
if (cloudSync.available()) {
  cloudSync.loadFromCloud().then(cloudSave => {
    // Compare badge counts: take the one with MORE badges
    // Prevents new phone from overwriting cloud progress
  });
}
```

### Cloud Sync Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Collection name | `user_saves` | Cloud DB collection for player saves |
| Permissions | "Only creator can read/write" | Each user sees ONLY their own save; privacy compliant |
| Debounce interval | 3000ms (3 seconds) | Prevents excessive cloud writes during continuous player movement |
| Conflict resolution | Higher badge count wins | When local save and cloud save differ, keep the one with more progress |

### What the User Must Do Manually

1. In WeChat DevTools → click "云开发" → create an environment
2. Copy the environment ID
3. Paste it into `app.js`: `const CLOUD_ENV = 'cloud1-xxxxxxxxx';`
4. In cloud console → Database → create collection named `user_saves`
5. In cloud console → `user_saves` permissions → set to **"Only creator can read/write"**

### Historical Pitfall: Black Screen

**Problem**: If `wx.cloud.database()` is called without prior `wx.cloud.init()`, it throws an exception. If this happens in `gameStore` constructor, the entire app crashes → black screen.

**Solution**: The 3-layer architecture above prevents this. `cloudSync.available()` checks `cloudReady` flag dynamically on EVERY call. If cloud is not initialized, all cloud code paths are skipped entirely.

---

## Privacy & Compliance System

### Privacy Authorization Flow

1. **`app.js` onLaunch** calls `wx.getPrivacySetting({ success, fail })`
   - If `needAuthorization === true`, shows a modal asking user to agree
   - User taps "同意并继续" → calls `wx.openPrivacyContract()` → opens WeChat's privacy policy page
   - User agrees → normal app flow continues
   - `fail` callback MUST exist (empty function is fine) to prevent crashes on old base libraries

2. **`app.js`** registers `wx.onNeedPrivacyAuthorization((resolve) => { ... })`
   - This is the official callback-based authorization hook
   - Must be registered in global scope

3. **Configuration switches** (already set correctly in project):
   - `project.config.json` → `setting.__usePrivacyCheck__: true`
   - `project.private.config.json` → `setting.__usePrivacyCheck__: true`
   - `app.json` → `requiredPrivateInfos: []` (empty = no sensitive permissions)
   - **DO NOT put `__usePrivacyCheck__` in `app.json`** — causes `backgroundfetch privacy fail` errors

### Privacy Policy Page (`pages/privacy/privacy`)

- Contains actual text for both **Privacy Policy** and **User Agreement** (tab switcher)
- Accessible from Settings page → "用户隐私保护指引" and "用户协议" buttons
- Uses standard pixel-art theme CSS matching the rest of the app
- Must have REAL content for audit (not just placeholder text)

### WeChat Backend Configuration (REQUIRED FOR AUDIT — User Must Do This)

1. Login to WeChat MP backend (微信公众平台)
2. Go to **设置 → 基本设置 → 用户隐私保护指引**
3. Fill in privacy policy text (can copy from `pages/privacy/privacy.wxml`)
4. Save and publish — this is what `wx.openPrivacyContract()` displays

---

## Logging System (Unified Error Reporting)

### Pattern: `utils/logger.js`

```javascript
// In any page:
const logger = require('../../utils/logger.js');

logger.info('pageName', 'action description', { data: value });    // Normal events
logger.warn('pageName', 'potential issue', { detail: info });      // Non-fatal problems
logger.error('pageName', 'error message', { error: errObj });      // Actual errors
```

### Global Error Capture (in `app.js`)

```javascript
// Uncaught JS errors:
onError(msg) {
  logger.error('app', 'onError', { message: msg });
}

// Unhandled Promise rejections:
onUnhandledRejection(res) {
  logger.error('app', 'onUnhandledRejection', { reason: res && res.reason });
}
```

### WeChat Realtime Log Integration

`logger.js` uses `wx.getRealtimeLogManager()` — errors/warnings are visible in WeChat DevTools console AND in WeChat's cloud realtime log viewer for production debugging.

**Historical pitfall**: Before unified logging, `console.log` statements were scattered throughout code. These were invisible in production — bugs appeared silently with no way to diagnose. Now every non-trivial operation logs through `logger`, making online issues traceable.

---

## Common Issues & Fixes (Historical Bug Knowledge Base)

### Issue 1: Black screen / App won't start

**Symptom**: App launches but shows nothing, or shows a blank black screen.

**Most likely cause** (in order of probability):
1. `gameStore` constructor threw an uncaught exception
2. `wx.cloud.database()` called without `wx.cloud.init()` (cloudSync bug)
3. Invalid field in `app.json` (e.g., accidentally added `__usePrivacyCheck__` or `subPackages`)
4. Corrupted `game_state` storage data

**Diagnosis steps**:
1. Open WeChat DevTools Console → check for red error messages
2. Check if `CLOUD_ENV` in `app.js` is empty (should be empty by default)
3. Verify `app.json` does NOT contain `__usePrivacyCheck__` or `subPackages`
4. Add `console.log` at beginning of `gameStore` constructor to trace where it crashes

**Fixes**:
- If cloud-related: `cloudSync.available()` must check `cloudReady` before ANY database call
- If constructor exception: ensure constructor has try-catch with fallback to minimal valid state
- If storage corruption: `wx.removeStorageSync('game_state')` to reset

### Issue 2: Images not loading on mobile (but work in DevTools)

**Symptom**: Works in simulator, but on real phone images are missing/blank.

**Causes & Fixes**:
1. **Wrong path format**: Path must start with `/` → `/images/buildings/library.png`
2. **File doesn't exist**: Verify actual filename in `images/` directory (all are PNG)
3. **subPackages configured**: Remove ANY `subPackages` array from `app.json` — this breaks resource path resolution on mobile
4. **Case sensitivity**: File system on mobile is case-sensitive; `Library.png` ≠ `library.png`

### Issue 3: "backgroundfetch privacy fail" error in console

**Cause**: `__usePrivacyCheck__` was added to `app.json`

**Fix**: Remove it from `app.json`. This switch belongs ONLY in `project.config.json` and `project.private.config.json`.

### Issue 4: Building count ≠ badge count (data inconsistency)

**Symptom**: Settings page shows different numbers for "已探索建筑数" vs "已收集徽章数"

**Root cause**: Some code was maintaining a separate `visitedBuildingIds` array independently of the backpack, causing them to drift apart.

**Permanent fix**: Both values are now ALWAYS derived from `backpack.count()`. The sync happens inside mutation APIs (`addToBackpack`, `removeFromBackpack`, `setCurrentBuilding`, `forceSyncToCloud`, `_applySnapshot`) each calling `stats.syncFromBackpack(backpack.count())`.

**If you see this issue again**: Check that some new code path did NOT reintroduce a separate counter. Search for `visitedBuildingIds` or manual `stats.buildingsVisited = X` outside of the backpack mutation methods.

### Issue 5: Total steps not resetting when starting new game

**Symptom**: User taps "新建游戏" → everything resets except step counter shows old value

**Root cause (historical)**: `pages/start/start.js` was manually calling `gameStore.setState({ player: ..., backpack: [], ... })` and forgot to include `stats.totalSteps` in the reset object.

**Fix**: ALWAYS use `gameStore.resetGame()` for new game. NEVER manually assemble reset state. `resetGame()` is the single source of truth for "what does a fresh game look like."

### Issue 6: Cloud sync button does nothing

**Symptom**: Tapping "同步进度到云端" in settings has no visible effect.

**Checklist**:
1. Is `CLOUD_ENV` in `app.js` filled with a real environment ID? (Blank by default = disabled)
2. Did user create a `user_saves` collection in cloud console?
3. Are `user_saves` collection permissions set to "仅创建者可读写"?
4. Is WeChat DevTools showing cloud console as "已开通"?

If all 4 are confirmed, check:
- `app.globalData.cloudReady` should be `true` after `wx.cloud.init` succeeds
- `cloudSync.available()` should return `true`
- Check DevTools Console / realtime logs for error messages from `cloudSync.js`

### Issue 7: Privacy policy page shows blank or cannot be opened

**Symptom**: Settings page → tap "用户隐私保护指引" → nothing happens or shows empty page.

**Fixes**:
1. Verify `pages/privacy/privacy` is registered in `app.json` `pages` array
2. Verify `wx.openPrivacyContract()` has both `success` and `fail` callbacks (no crash on old base library versions)
3. Settings page fallback: if `wx.openPrivacyContract()` fails, navigate to internal `pages/privacy/privacy` page as fallback

### Issue 8: Player can walk through buildings / collision not working

**Symptom**: Player sprite passes through building areas on map.

**Root cause**: `collisionZone` in `data/buildings.js` may have wrong coordinates, OR `pages/map/map.js` collision detection isn't checking collision zones.

**Debug**: Each building in `buildings.js` has `collisionZone: { x, y, w, h }`. In DevTools, temporarily add visual overlay showing collision zones to verify coordinates match the pixel-art building positions on the map image.

### Issue 9: Building bubble never appears / doesn't trigger

**Symptom**: Player walks near building but no info bubble appears.

**Root cause**: `triggerZone` coordinates don't match actual building position on map.

**Debug**: Each building in `buildings.js` has `triggerZone: { x, y, w, h }`. Compare these coordinates against the map image pixel positions. DevTools coordinate display (available in map page debug mode) shows current player position — walk to where the building should trigger, note the coordinates, and adjust `triggerZone` to match.

### Issue 10: Audio not playing or volume issues

**Symptom**: Background music doesn't start, or volume slider doesn't work.

**Checklist**:
1. Verify `audio/bgm.mp3` and `audio/bgm2.mp3` exist (not zero-byte files)
2. Check `utils/audioManager.js` — uses InnerAudioContext singleton
3. Check settings page: audio toggle is ON, volume > 0
4. Audio state is persisted via `wx.setStorageSync` — check if corrupted storage value
5. Some Android devices need explicit user gesture (button tap) before audio starts

---

## Standard Code Patterns to Follow

### Pattern 1: Adding a New Setting to gameStore

```javascript
// Step 1: Add field to initial state in gameStore.js constructor
// (declare as this.yourNewField = defaultValue, not inside this.state object)
this.yourNewField = defaultValue;    // ← ADD HERE

// Step 2: Add setter method (if write access needed)
setYourNewField(value) {
  this.yourNewField = value;
  this.notify();
}

// Step 3: Add to _snapshot() — include in persistence JSON object
_snapshot() {
  return {
    ...existing fields...,
    yourNewField: this.yourNewField,  // ← ADD HERE
  };
}

// Step 4: Add to _applySnapshot(data) — read from saved data
_applySnapshot(data) {
  if (data && typeof data.yourNewField !== 'undefined') {  // ← ADD type check
    this.yourNewField = data.yourNewField;
  }
}

// Step 5: Add to getState() — expose in public snapshot (if needed by pages)
getState() {
  return {
    ...existing fields...,
    yourNewField: this.yourNewField,  // ← ADD HERE (only if pages read it)
  };
}

// Step 6: Add to setState(partial) — merge support (if field is writable via setState)
setState(partial) {
  if (!partial || typeof partial !== 'object') return;
  if ('yourNewField' in partial) {      // ← ADD type-specific branch
    this.yourNewField = partial.yourNewField;
  }
  this.notify();
}

// Step 7: Add to resetGame() if it should reset on new game
resetGame() {
  this.yourNewField = defaultValue;   // ← ADD HERE (if should reset)
  this.notify();
}
```

**Historical pitfall**: Forgetting to add the field to `_snapshot()` and `_applySnapshot()` means the value exists in memory but disappears after app restart. ALWAYS update all 6-7 places.

**Modern approach**: The `_save()` / `_restore()` pattern was replaced with `_snapshot()` / `_applySnapshot()` + `_persist()` → `persistence.save(snapshot)`. If you find references to `_save()` / `_restore()`, update them to use the new API.

### Pattern 2: Adding a New Building

```javascript
// Step 1: Add image to images/buildings/yourbuilding.png
// Step 2: Add badge icon to images/badges/yourbuilding-badge.png

// Step 3: Add entry to data/buildingHistory.js
module.exports = {
  ...existing entries...,
  yourbuilding: '这是 XXX 的历史介绍文字...',
};

// Step 4: Add entry to data/buildings.js
{
  id: 'yourbuilding',
  name: 'XXX 名称',
  image: '/images/buildings/yourbuilding.png',
  historyText: HISTORY_TEXTS.yourbuilding,
  badge: {
    id: 'badge_yourbuilding',
    name: 'XXX 徽章',
    image: '/images/badges/yourbuilding-badge.png',
    description: '探索 XXX 获得的徽章'
  },
  triggerZone: { x: 0, y: 0, w: 120, h: 110 },  // Calibrate after testing
  collisionZone: { x: 0, y: 0, w: 120, h: 110 },
  description: 'XXX 介绍'
}

// Step 5: Launch DevTools, walk to building area, calibrate triggerZone coords
```

### Pattern 3: Adding Logging to New Code

```javascript
const logger = require('../../utils/logger.js');

// At start of key functions:
logger.info('mypage', 'functionName entered', { param: value });

// On errors:
try {
  riskyOperation();
} catch (e) {
  logger.error('mypage', 'riskyOperation failed', { error: e && e.message });
}

// On successful completion of significant operations:
logger.info('mypage', 'badge collected', { buildingId: id, currentBadgeCount: state.backpack.length });
```

### Pattern 4: Conditional Cloud Operation

```javascript
const cloudSync = require('../../utils/cloudSync.js');

// ALWAYS check available() before any cloud operation:
if (cloudSync.available()) {
  cloudSync.someOperation({ ... })
    .then(result => {
      logger.info('mypage', 'cloud op succeeded', { result });
    })
    .catch(err => {
      logger.warn('mypage', 'cloud op failed', { error: err && err.message });
      // DO NOT show error toast to user — cloud sync is progressive enhancement
      // Local save still works; user experience is unaffected
    });
}
// If not available: silently skip. No user-visible change needed.
```

---

## Development Workflow (Step-by-Step)

1. **Read `DEVELOPER_RULES.md`** — top of the file, mandatory
2. **Read relevant source files** — understand current code BEFORE making changes
3. **Verify resource files exist** — check `images/` directory before writing image paths
4. **Check `data/buildingHistory.js`** — if modifying building text, check current structure
5. **Make minimal changes** — follow patterns in "Standard Code Patterns" section
6. **Data consistency check**: Did you update `_snapshot()`, `_applySnapshot()`, `getState()`, `setState()`, `resetGame()` for new state fields?
7. **Test in WeChat DevTools**: Clear cache → Full clear → Compile → no console errors
8. **Test building pages**: Enter each building, verify image + text + badge work
9. **Test new game**: Tap "新建游戏" → verify ALL counters reset to 0
10. **Test settings**: Day/night toggle, seasons, privacy page navigation
11. **Test on real device**: Scan QR code, test on actual phone (mobile path resolution differs from simulator)
12. **Verify logger usage**: New code should use `logger.info/warn/error` instead of bare `console.log`
13. **Update DEVELOPER_RULES.md** if you discovered a new pitfall or design decision

---

## Testing Checklist (Run Through This Before Considering Work Complete)

- [ ] **DevTools compile**: Clear cache → Full clear → Compile → No red error messages in Console
- [ ] **Start page**: Page loads, "进入校园" button works, "新建游戏" button works
- [ ] **Map page**: Canvas renders map, player appears at spawn position
- [ ] **Joystick**: Player moves when joystick dragged, direction changes properly
- [ ] **Building detection**: Player walks near each of 6 buildings → bubble/trigger appears
- [ ] **Building detail pages**: Correct image loads, history text displays, badge collection works
- [ ] **Backpack**: Badges appear after collection, page lists collected items
- [ ] **New game**: "新建游戏" → player at spawn, backpack empty, totalSteps = 0, buildingsVisited = 0, badgesCollected = 0
- [ ] **Settings page**: Day/night toggle works, season dropdown works, privacy link opens privacy page
- [ ] **Stats display**: Settings shows correct totalSteps, buildingsVisited = badgesCollected
- [ ] **Cloud sync button**: If CLOUD_ENV set → sync works; if not set → silently skipped (no error shown to user)
- [ ] **Sports field**: Entering sports building routes to sports page, independent map works
- [ ] **Audio (if applicable)**: Background music plays where configured, volume controls work
- [ ] **Back navigation**: Can return from building/sports/settings/backpack/privacy pages to map
- [ ] **Real device test**: Scan QR code with phone → verify same flow works on real hardware (mobile path resolution is stricter than simulator)
- [ ] **No new console errors**: Check DevTools Console for any red errors during the entire test flow

---

## File Modification Reference (What to Check When Modifying Each File)

| When you modify this file | Check whether these files also need updates |
|--------------------------|-------------------------------------------|
| `store/gameStore.js` (add new state field) | `_snapshot()` for persistence, `_applySnapshot()` for loading, `getState()` / `setState()` exposure, `resetGame()` for new game reset |
| `data/buildings.js` (add building) | `data/buildingHistory.js` (add text), verify image files exist in `images/buildings/` and `images/badges/` |
| `pages/start/start.js` | `gameStore.resetGame()` call for "新建游戏" button (never manual setState) |
| `pages/settings/settings.js` | GameStore state reads: did you add fields that settings displays? |
| `pages/map/map.js` | `services/buildingService.js` building detection, `gameConfig.js` map size constants |
| `utils/cloudSync.js` | `app.js` (CLOUD_ENV and cloudReady flag), `gameStore.js` (_persist calls persistence.save which syncs to cloud) |
| `app.json` | DO NOT add `__usePrivacyCheck__`, `subPackages`, or `"webp": true`. New pages must be registered. |
| `project.config.json` | Keep `__usePrivacyCheck__: true` in `setting`. `appid` should NOT change. |