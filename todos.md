# Maukemana v1.3.0 Development Checklist: The Game of Discovery

## Phase 1: Backend Foundation & Data Layer (Gamified)

**Focus:** Establishing the schema for social cartography and real-time utility data.

- [x] **BE-101: Database Schema Expansion (PostGIS + Game Layer)**

  - **Description:** Initialize/Update PostgreSQL with PostGIS and gaming tables.
  - **Technical Details:**
    - [x] Enable `postgis` extension.
    - [x] Create `verification_status` ENUM ('pending', 'approved', 'rejected').
    - [x] Create `points_of_interest` table with `founding_user_id` and granular utility columns (wifi_speed, ergonomics, plugs).
    - [x] Create `user_territory_stats` table for District/Juragan tracking.
    - [x] Create `user_profiles` table for XP, Scouter levels, and impact scores.
    - [x] Create `photos` table with `vibe_category` and `score` ranking.
  - **Acceptance Criteria:**
    - [x] Schema matches PRD v1.3.0 exactly.
    - [x] Spatial indices (GIST) active on location columns.

- [x] **BE-102: API - The "Flag Planting" Submission**

  - **Description:** Create `POST /api/v1/poi/submit` with validation and initial XP reward.
  - **Technical Details:**
    - [x] Auto-calculate `district_name` via reverse geocoding on submission.
    - [x] Force default status = 'pending'.
    - [x] Logic: If approved later, trigger +100 XP to user.
  - **Acceptance Criteria:**
    - [x] Successful submission returns 201 Created and "Queued for Review" status.

- [x] **BE-103: API - Discovery & Spatial Filtering**

  - **Description:** Create `GET /api/v1/poi` with hyper-filtering support.
  - **Technical Details:**
    - [x] Support Query Params: lat, long, radius, wifi_speed_min, ergonomics, power_sockets.
    - [x] Result set includes `founding_user_username` and top-ranked images.
  - **Acceptance Criteria:**
    - [x] Filtering by "Fast Wi-Fi" (>50Mbps) returns only high-speed spots.

- [ ] **BE-104: XP & Leaderboard Service**
  - **Description:** Real-time XP calculation and Juragan status management.
  - **Technical Details:**
    - [ ] Create `GET /api/v1/leaderboard/:district` to fetch top 3 contributors.
    - [ ] Logic: Set `is_juragan = true` for the #1 user in each district polygon.

---

## Phase 2: The "Flag Planting" Engine (Epic 1)

**Focus:** Frictionless, gamified mobile submission flow.

- [x] **FE-201: The "Scanner" Interface (SUB-101)**

  - **Description:** Camera view with "Scanning..." overlay instead of a standard form.
  - **Technical Details:**
    - [x] Check GPS against existing POIs.
    - [ ] Trigger "New Discovery" gold animation for uncharted territory.
    - [ ] Prompt "Update Intel" mode for existing POIs (+20 XP).
  - **Acceptance Criteria:**
    - [x] Visual feedback "Scanning territory..." when opening the camera.

- [x] **FE-202: Gamified "Vibe Check" (SUB-102)**

  - **Description:** Granular input for utility data using iconic toggles.
  - **Technical Details:**
    - [x] Wi-Fi: Embedded speedtest visual (+30 XP if run).
    - [ ] Power: [Everywhere | Wall-only | None].
    - [ ] Ergonomics: Toggles for chair types (Padded/Office/Hard).
  - **Acceptance Criteria:**
    - [x] Zero text-entry for attributes; all icon/toggle driven.

- [x] **FE-203: The Ownership Claim Modal (SUB-103)**
  - **Description:** Success screen reinforcing the goal of becoming a "Founding Scout."
  - **Acceptance Criteria:**
    - [x] Success modal shows "Flag Planted" with Scout branding.

---

## Phase 3: Core Discovery & Map Dynamics (Epic 2)

**Focus:** Visualizing the "Fog of War" and territory dominance.

- [x] **FE-301: Map Dynamics (Fog of War & Verified Pins)**

  - **Description:** Mapbox implementation with visual cues for data density.
  - **Technical Details:**
    - [ ] Layer: Desaturate/Dim low-density districts ("Fog of War"). _(Deferred: needs backend)_
    - [x] Markers: Green Check for verified, Grey for pending/low-confidence.
  - **Acceptance Criteria:**
    - [x] User can clearly see which areas need mapping.

- [x] **FE-302: The Hyper-Filter Modal (DIS-201)**

  - **Description:** Interface for high-fidelity discovery.
  - [x] Modal overlay with UI components mirroring "Add Spot".
  - [x] "Apply" button constructs query string for BE-103.
  - [x] "Reset" clears all active filters.
  - **Acceptance Criteria:**
    - [x] Selecting filters (e.g., Fast Wi-Fi + Office Chairs) updates map markers.

- [ ] **FE-303: Juragan District Leaderboard (DIS-203)**

  - **Description:** Floating glass card showing neighborhood bosses.
  - **Technical Details:**
    - [ ] Trigger: Show card when map center enters a new district polygon.
    - [ ] Display Top 3 Juragans with crown icons.

- [ ] **FE-304: POI Detail View (The Trophy Case)**
  - **Description:** Full page view featuring the Founding Scout prominently.
  - **Technical Details:**
    - [ ] Display Founding Scout’s avatar on the hero section.
    - [ ] Display Icon Grid for utility attributes (Wi-Fi speed, Plugs).

---

## Phase 4: Community & Verification Engine (Epic 3)

**Focus:** Engaging passive users to clean data via micro-actions.

- [ ] **FE-401: Tinder-Style "Vibe Verification" (COM-301)**

  - **Description:** Quick swipe interface to verify community photos/data.
  - **Technical Details:**
    - [ ] Swipe Right (Yes) / Swipe Left (No) for data accuracy (e.g., "Is this chair ergonomic?").
    - [ ] Reward +5 XP per swipe.

- [ ] **FE-402: Reddit-Style Photo Ranking (COM-302)**
  - **Description:** Upvote/Downvote logic to pick the "Hero Image."
  - **Acceptance Criteria:**
    - [ ] Highest-scored photo becomes the thumbnail/hero automatically.

---

## Phase 5: Identity & Profile (Epic 4)

**Focus:** The Scout's permanent record and status.

- [ ] **FE-501: The Glass Passport (PRO-401)**

  - **Description:** Futuristic, glassmorphic profile page (ID Card style).
  - **Data Points:** Rank (Tourist -> Scout -> Legend), Territories Ruled, Impact Score.

- [ ] **FE-502: Shareable Artifacts (PRO-402)**
  - **Description:** Generate "Passport" image for social sharing (Instagram Stories).

---

## Phase 6: Admin "God Mode" (Epic 5)

**Focus:** Internal tools for content moderation and "Minting" legacy.

- [ ] **ADM-601: Submission Queue & Approval**

  - **Description:** Queue for admins to review and "Mint" Founding Scouts.
  - **Actions:** Approve & Mint, Edit & Approve, Reject (Spam).
  - **Technical Details:** Assigns `founding_user_id` upon approval.

- [ ] **ADM-602: Data Quality Dashboard**
  - **Description:** Oversight of verified vs unverified pins and community consensus.

---

## Game Mechanics Summary (The Rules)

| Action             | XP Reward | Condition                 |
| ------------------ | --------- | ------------------------- |
| **Plant Flag**     | 100 XP    | Admin approval required.  |
| **Update Intel**   | 20 XP     | Validating existing data. |
| **Verify (Swipe)** | 5 XP      | Accuracy check.           |
| **Speedtest**      | 30 XP     | Actual test run > 10Mbps. |
