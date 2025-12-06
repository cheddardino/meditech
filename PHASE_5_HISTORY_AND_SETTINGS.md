# Phase 5: History, Settings & Onboarding (Enhancement)

**Goal:** Implement data persistence for scan history, allow profile management, and guide new users.

**Estimated Time:** 45-60 minutes

**Prerequisites:** Phase 4 completed successfully

---

## Instructions for AI

We need to turn this from a "utility" into a full "app" by adding history, settings, and onboarding.

### Step 1: Implement History Service

Users need to see what they scanned previously.

Create `src/services/historyService.ts`:
- Use `AsyncStorage` (or SQLite if complex) to store an array of `MedicineInfo` objects with timestamps.
- Implement `addToHistory(item: MedicineInfo)`, `getHistory()`, `clearHistory()`.
- **Validation:** Ensure duplicates aren't added spam-style.

### Step 2: Create History Screen

Create `src/screens/history/HistoryScreen.tsx`:
- Display a `FlatList` of past scans.
- Clicking an item should navigate to `MedicineInfoScreen` (reuse the screen from Phase 4).
- Add a "Clear History" button.

### Step 3: Create Profile & Settings Screen

Create `src/screens/profile/ProfileScreen.tsx`:
- Display the User's BioData (from Phase 1).
- Allow editing of BioData (reuse or adapt `BioDataScreen` components).
- Add "Logout" functionality (clear session via `StorageService` and reset Navigation).
- Add a toggle for "Dark Mode" (using NativeWind/Tailwind).

### Step 4: Onboarding Flow

Create `src/screens/onboarding/OnboardingScreen.tsx`:
- Use `react-native-pager-view` or a simple horizontal ScrollView.
- Show 3 slides:
    1. "Scan your medicine"
    2. "Get AI-powered insights"
    3. "Track your health"
- Show this screen ONLY if it's the first time the user opens the app (check a `HAS_LAUNCHED` flag in Storage).
- Update `AppNavigator` to show this before Login if applicable.

### Step 5: Polish & Empty States

- Add "Empty State" components for History (e.g., "No scans yet? Start now!").
- Add a "Loading" skeleton for the Dashboard.
