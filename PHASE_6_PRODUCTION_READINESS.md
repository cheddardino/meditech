# Phase 6: Production Readiness & Deployment

**Goal:** Final quality assurance, asset generation, and preparing for the app store.

**Estimated Time:** 60+ minutes

**Prerequisites:** Phase 5 completed successfully

---

## Instructions for AI

The code is done. Now we make it a product.

### Step 1: Asset Generation

- **App Icon:** Ensure `assets/icon.png` is replaced with the real logo.
- **Splash Screen:** Update `assets/splash.png`.
- **Config:** Update `app.json` with the correct `bundleIdentifier` (iOS) and `package` (Android).

### Step 2: Automated Testing (E2E)

We skipped unit tests for speed, but we need E2E tests to ensure the critical flows work.

- Install **Maestro** (or Detox).
- Create a simple flow `e2e/login_and_scan.yaml`:
    1. Launch App.
    2. Enter Mock Credentials.
    3. Tap Login.
    4. Verify Dashboard appears.
    5. Tap "Scan" (Mock Camera).
    6. Verify Result appears.

### Step 3: Offline Handling & Edge Cases

- Install `@react-native-community/netinfo`.
- Wrap the `GeminiService` call in a check:
    ```typescript
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error("No internet connection. Please check your settings.");
    }
    ```
- Ensure the `ErrorBoundary` (from Phase 2) catches these errors gracefully.

### Step 4: Build Configuration (EAS)

- Install EAS CLI: `npm install -g eas-cli`.
- Run `eas build:configure`.
- Set up `eas.json` for `preview` (simulator) and `production` (store).

### Step 5: Final Security Audit

- **Check:** Are any API keys hardcoded? (Verify `.env` usage).
- **Check:** Is `console.log` stripped in production? (Configure babel plugin `transform-remove-console`).
- **Check:** Are dependencies up to date? (`npm audit`).
