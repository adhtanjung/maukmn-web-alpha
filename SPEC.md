# **Maukemana v1.0.1 – Technical Specification**

**Generated:** 2026-01-01
**Based on:** PRD v1.0.1 + Comprehensive Interview
**Status:** Ready for Implementation

---

## **1. Product Vision**

> _"We show you what you actually need."_

Maukemana solves the gap between uncurated Google Places data and unstructured TikTok content. It's a hyper-personalized, community-curated discovery platform for Indonesia—starting with Bali (Canggu, Ubud) and Jakarta (Senopati/SCBD).

**Success Definition:** Become the go-to app when people want to find their next place to visit or activity to do.

**Biggest Risk:** Data quality—insufficient POI density to be useful.

---

## **2. Technical Architecture Decisions**

### **2.1 Core Stack**

| Layer         | Technology                   | Notes                                  |
| ------------- | ---------------------------- | -------------------------------------- |
| Frontend      | Next.js + TailwindCSS        | PWA-enabled                            |
| Database      | PostgreSQL + PostGIS         | Supabase-hosted recommended            |
| Maps          | Mapbox GL JS                 | Lightweight popups, tile caching       |
| CDN/Media     | Cloudinary or S3             | WebP optimization                      |
| Auth          | Supabase Auth (Google OAuth) | Simple RBAC for admin roles            |
| Observability | LGTM Stack                   | Loki, Grafana, Tempo, Mimir/Prometheus |

### **2.2 Database Schema (Revised)**

#### Core Tables

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Hierarchical categories
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_category_id UUID REFERENCES categories(category_id),
    name_key VARCHAR(100) NOT NULL, -- i18n key: 'category.cafe'
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indonesia administrative hierarchy
CREATE TABLE addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street_address TEXT,
    kelurahan VARCHAR(100),        -- Sub-district (Canggu)
    kecamatan VARCHAR(100),        -- District (Kuta Utara)
    kabupaten VARCHAR(100),        -- Regency (Badung)
    provinsi VARCHAR(100),         -- Province (Bali)
    postal_code VARCHAR(10),
    boundary GEOGRAPHY(Polygon, 4326),
    display_name VARCHAR(255) GENERATED ALWAYS AS (
        COALESCE(street_address || ', ', '') || kelurahan || ', ' || kabupaten
    ) STORED
);

-- Admin-controlled vocabularies with aliasing
CREATE TABLE vocabularies (
    vocab_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocab_type VARCHAR(50) NOT NULL, -- 'amenity', 'food_option', 'event', etc.
    key VARCHAR(100) NOT NULL,       -- i18n key: 'amenity.wifi'
    aliases TEXT[],                  -- ['WiFi', 'Wifi', 'wi-fi']
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- Main POI table
CREATE TABLE points_of_interest (
    poi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(category_id),
    website VARCHAR(255),
    brand VARCHAR(100),
    description TEXT,

    -- Geospatial
    address_id UUID REFERENCES addresses(address_id),
    location GEOGRAPHY(Point, 4326),
    parking_info TEXT,

    -- Amenities (references vocabulary keys)
    amenities TEXT[],               -- ['amenity.wifi', 'amenity.power_outlets']
    has_wifi BOOLEAN DEFAULT FALSE,
    outdoor_seating BOOLEAN DEFAULT FALSE,
    is_wheelchair_accessible BOOLEAN DEFAULT FALSE,
    has_delivery BOOLEAN DEFAULT FALSE,

    -- Food & Drink
    cuisine VARCHAR(100),
    price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
    food_options TEXT[],            -- ['food.vegan', 'food.halal']
    featured_menu_items VARCHAR(100)[],
    specials VARCHAR(100)[],

    -- Logistics
    open_hours JSONB,
    secondary_open_hours JSONB,
    reservation_platform VARCHAR(255),
    reservation_required BOOLEAN DEFAULT FALSE,
    payment_options TEXT[],         -- ['payment.qris', 'payment.cash']
    wait_time_estimate INTEGER,

    -- Lifestyle
    kids_friendly BOOLEAN DEFAULT FALSE,
    smoker_friendly BOOLEAN DEFAULT FALSE,
    pet_friendly TEXT[],            -- ['pet.dogs', 'pet.cats']

    -- Social & Events
    social_media_links JSONB,
    events TEXT[],                  -- ['event.live_music']
    events_calendar JSONB,
    happy_hour_info TEXT,
    loyalty_program TEXT,

    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Separate reviews table (normalized)
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES points_of_interest(poi_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos with time-decay scoring
CREATE TABLE photos (
    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES points_of_interest(poi_id) ON DELETE CASCADE,
    user_id UUID,
    url TEXT NOT NULL,
    original_url TEXT,              -- Preserved original with EXIF
    is_admin_official BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Admin override
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vote tracking
CREATE TABLE photo_votes (
    vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID REFERENCES photos(photo_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    vote_type SMALLINT CHECK (vote_type IN (-1, 1)), -- -1 = downvote, 1 = upvote
    reason VARCHAR(50),             -- Optional: 'blurry', 'irrelevant', 'outdated'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id, user_id)
);

-- Offline sync queue tracking
CREATE TABLE sync_queue (
    queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(50),        -- 'poi', 'photo'
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    conflict_data JSONB,            -- For conflict resolution UI
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);
```

#### Materialized Views for Performance

```sql
-- Regional view with hero image (refreshed every 5-15 min)
CREATE MATERIALIZED VIEW mv_pois_with_hero AS
SELECT
    p.poi_id, p.name, p.category_id, p.location, p.has_wifi,
    p.outdoor_seating, p.price_range, p.pet_friendly,
    a.kelurahan, a.kabupaten, a.provinsi,
    (
        SELECT url FROM photos ph
        WHERE ph.poi_id = p.poi_id
          AND (ph.is_pinned = TRUE OR TRUE)
        ORDER BY ph.is_pinned DESC,
                 -- Time-decay hot score (Reddit-style)
                 (ph.upvotes - ph.downvotes) /
                 POWER(EXTRACT(EPOCH FROM (NOW() - ph.created_at)) / 3600 + 2, 1.5) DESC
        LIMIT 1
    ) as hero_image_url,
    COALESCE(
        (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews r WHERE r.poi_id = p.poi_id),
        0
    ) as rating_avg,
    (SELECT COUNT(*) FROM reviews r WHERE r.poi_id = p.poi_id) as reviews_count
FROM points_of_interest p
LEFT JOIN addresses a ON p.address_id = a.address_id;

CREATE INDEX idx_mv_pois_location ON mv_pois_with_hero USING GIST (location);
CREATE INDEX idx_mv_pois_filters ON mv_pois_with_hero (has_wifi, outdoor_seating, price_range);
```

---

## **3. PWA & Offline Architecture**

### **3.1 Service Worker Strategy**

- **Workbox** for caching strategies
- **IndexedDB** (via Dexie.js) for offline queue
- Mapbox tiles pre-cached for launch regions

### **3.2 Offline Queue Flow**

```
[Scout fills form] → [Save to IndexedDB]
        ↓
[Background: Check connectivity]
        ↓
[Online?] → YES → [Attempt sync to API]
        ↓              ↓
       NO        [Conflict?] → YES → [Store conflict, show UI]
        ↓              ↓
[Stay in queue]       NO → [Mark synced, remove from queue]
        ↓
[App reopened] → [Show "Resume Upload" prompt]
```

### **3.3 Photo Upload Pipeline**

1. **Capture** via MediaDevices API
2. **Compress client-side**: WebP @ 0.82 quality, max 1920px width
3. **Store original** with EXIF in separate bucket (admin-access only)
4. **Strip EXIF** from display version
5. **Queue in IndexedDB** if offline
6. **Upload to Cloudinary** with auto-optimization

---

## **4. Community & Gamification**

### **4.1 Voting System**

- **Time-decay "Hot" ranking** for photos (Reddit-style)
- Formula: `score / (hours_since_post + 2)^1.5`
- Admin photos compete in same pool with "Official" badge
- **Downvote reasons** (optional): blurry, irrelevant, outdated

### **4.2 Gamification Elements**

| Achievement   | Trigger                       |
| ------------- | ----------------------------- |
| First Vote    | Cast 1st upvote/downvote      |
| Curator       | 50 total votes                |
| Trendsetter   | Photo reaches top 3 for a POI |
| Explorer      | Visit 10 unique POI pages     |
| Scout (Admin) | Create 50 POIs                |

### **4.3 Leaderboard**

- Weekly & all-time rankings
- Metrics: votes cast, photos uploaded, photo scores
- Badge display on user profiles

### **4.4 Kill Switch**

Emergency toggle to disable community voting:

- All hero images fallback to admin-pinned or most recent admin photo
- Endpoint: `POST /api/admin/voting/toggle`

---

## **5. Mapbox Implementation**

### **5.1 Pin Strategy**

- **Clustering** enabled at zoom < 14
- **Priority pins** for higher-rated POIs (larger/brighter)
- Pin color by category (configurable)

### **5.2 Interactions**

- **Tap pin** → Mapbox popup (lightweight, in-canvas)
- Popup shows: name, hero image thumbnail, rating, top 2 amenity icons
- **"View Details"** button → navigates to POI page

### **5.3 Offline Tiles**

- Pre-cache Canggu, Ubud, Senopati/SCBD tiles in SW
- `mapbox://styles/maukemana/custom` (basic style, no custom Studio build for MVP)

---

## **6. Design System**

### **6.1 Color Palette**

| Token               | Value                      | Usage                                               |
| ------------------- | -------------------------- | --------------------------------------------------- |
| `--bg-primary`      | `#121212`                  | Main background (dark gray, softer than OLED black) |
| `--bg-secondary`    | `#1E1E1E`                  | Cards, bottom sheets, elevated surfaces             |
| `--bg-tertiary`     | `#2A2A2A`                  | Input fields, hover states                          |
| `--surface-overlay` | `rgba(30, 30, 30, 0.85)`   | Semi-transparent overlays (no blur)                 |
| `--text-primary`    | `#FFFFFF`                  | Headings, primary text                              |
| `--text-secondary`  | `#A0A0A0`                  | Captions, metadata                                  |
| `--text-muted`      | `#666666`                  | Disabled, placeholders                              |
| `--accent`          | `#10B981`                  | Emerald – CTAs, active states, map pins             |
| `--accent-hover`    | `#059669`                  | Emerald darker – hover states                       |
| `--accent-subtle`   | `rgba(16, 185, 129, 0.15)` | Accent backgrounds, badges                          |
| `--success`         | `#22C55E`                  | Open status, positive feedback                      |
| `--warning`         | `#F59E0B`                  | Attention, alerts                                   |
| `--error`           | `#EF4444`                  | Errors, closed status                               |

### **6.2 Typography**

| Element  | Font              | Size | Weight          |
| -------- | ----------------- | ---- | --------------- |
| Display  | Plus Jakarta Sans | 32px | 700             |
| H1       | Plus Jakarta Sans | 24px | 700             |
| H2       | Plus Jakarta Sans | 20px | 600             |
| H3       | Plus Jakarta Sans | 16px | 600             |
| Body     | Plus Jakarta Sans | 14px | 400             |
| Caption  | Plus Jakarta Sans | 12px | 400             |
| Overline | Plus Jakarta Sans | 10px | 600 (uppercase) |

**Font Import:**

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap");
```

### **6.3 Layout: TikTok-Style Vertical Feed**

The discovery experience uses a **full-screen vertical swipe feed** (not cards):

```
┌─────────────────────────────┐
│  [Hero Image - Full Bleed]  │  ← 70% viewport height
│                             │
│  ┌─────────────────────┐    │
│  │ ▲ 124  ▼            │    │  ← Voting overlay (left edge)
│  └─────────────────────┘    │
│                             │
│  ───────────────────────    │
│  POI Name                   │  ← Bottom gradient overlay
│  ★ 4.8 · Cafe · 0.3km      │
│  "Best coffee in Canggu..." │
│  [📶] [🔌] [🐕] [Open Now]  │  ← Amenity chips + status
│  ─────────────────────────  │
│  [🔍 Filter] [🗺️ Map]       │  ← Sticky bottom nav
└─────────────────────────────┘
```

**Swipe Behaviors:**

- **Swipe up:** Next POI
- **Swipe down:** Previous POI
- **Tap image:** Expand to full detail page
- **Tap map icon:** Switch to map view (maintains filters)

### **6.4 Filter UI: Bottom Sheet**

Filters are accessed via a **slide-up bottom sheet**:

```
┌─────────────────────────────┐
│  ═══════                    │  ← Drag handle
│  Filters                    │
│  ─────────────────────────  │
│                             │
│  Category                   │
│  [Cafe] [Restaurant] [Bar]  │  ← Horizontal scroll chips
│                             │
│  Amenities                  │
│  [☑ WiFi] [☐ Outdoor]       │  ← Toggle chips
│  [☐ Power] [☐ Pet-friendly] │
│                             │
│  Price Range                │
│  [$] [$] [$$] [$$$]         │  ← Segmented control
│                             │
│  Distance                   │
│  ○───────●──────○           │  ← Slider
│  500m        5km            │
│                             │
│  [Reset]        [Show 42 ▶] │  ← Actions
└─────────────────────────────┘
```

**Sheet behavior:**

- **Peek state:** 40% screen height
- **Expanded state:** 85% screen height
- Dismiss on outside tap or swipe down

### **6.5 Map View**

| Element          | Specification                                 |
| ---------------- | --------------------------------------------- |
| **Default zoom** | Level 14 (neighborhood)                       |
| **Clustering**   | Enabled at zoom < 14, emerald cluster circles |
| **Pin size**     | 32px default, 40px for rating > 4.5           |
| **Pin color**    | Emerald (`#10B981`) with category icon        |
| **Selected pin** | Scale 1.2x, drop shadow                       |

**Popup Content:**

```
┌─────────────────────────┐
│ [Thumbnail] POI Name    │
│ ★ 4.8 · Open until 10PM │
│ "Best matcha latte..."  │
│ [View Details →]        │
└─────────────────────────┘
```

### **6.6 Animation & Motion**

**Level: Moderate**

| Interaction      | Animation                        |
| ---------------- | -------------------------------- |
| Page transitions | 250ms ease-out slide             |
| Bottom sheet     | 300ms spring (overdamp)          |
| Vote tap         | Icon fill + subtle scale (100ms) |
| Skeleton loaders | Shimmer gradient                 |
| Pin tap          | Scale 1.0 → 1.2 (150ms)          |
| Feed swipe       | Momentum-based with snap         |

**No animations:**

- Parallax effects
- Confetti/particles
- Complex micro-interactions

### **6.7 Responsive Strategy**

**Mobile-first** with progressive enhancement:

| Breakpoint | Target            | Layout Changes                               |
| ---------- | ----------------- | -------------------------------------------- |
| 375px      | Mobile baseline   | Full vertical feed, bottom nav               |
| 768px      | Tablet (optional) | No special treatment, same as mobile         |
| 1024px     | Desktop           | Split view: feed left (40%), map right (60%) |
| 1280px     | Desktop max-width | Centered container, side margins             |

**Navigation:**

- **Mobile:** Bottom navigation bar (5 items max)
  - `[Home/Feed]` `[Search]` `[Map]` `[Saved]` `[Profile]`
- **Desktop:** Top nav + persistent sidebar

### **6.8 States & Empty Views**

**Empty State (No Results):**

```
┌─────────────────────────────┐
│                             │
│      [Illustration]         │  ← Custom illustration
│                             │
│   No places found           │
│   Try adjusting your        │
│   filters or exploring      │
│   a different area          │
│                             │
│   [Remove filters]          │  ← Ghost button
└─────────────────────────────┘
```

**Loading State:**

- **Map view:** Map loads first, then pins populate progressively (nearest first)
- **Feed view:** Skeleton with shimmer (image placeholder + text lines)
- Progressive image loading: blur-up technique (tiny placeholder → full)

### **6.9 Scout Form UX (Admin)**

- **Multi-select chips** from admin vocabulary
- **Toggle switches** for booleans (not checkboxes)
- **One-tap GPS** with accuracy indicator ring
- **Progress indicator** showing upload queue status
- **Offline badge** when in offline mode

### **6.10 Accessibility**

- Minimum touch target: 44x44px
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators for keyboard navigation
- Screen reader labels for all interactive elements

### **6.11 Graceful Degradation**

- Detect low-end devices via `navigator.deviceMemory`
- If < 4GB RAM:
  - Disable all animations
  - Reduce map detail level
  - Lazy load images more aggressively

---

## **7. Data Freshness Strategy**

### **7.1 Automated Accuracy Prompts**

- After user visits POI page 3+ times in 30 days:
  > "Is this still accurate? [Yes] [Report Issue]"
- Issues flagged for admin review

### **7.2 Periodic Re-verification**

- POIs not updated in 6 months → flagged for Scout re-visit
- Admin dashboard: "Stale POIs" queue sorted by visit frequency

---

## **8. Authentication & Authorization**

### **8.1 User Roles (RBAC)**

| Role          | Permissions                                      |
| ------------- | ------------------------------------------------ |
| `anonymous`   | Browse, filter, view                             |
| `user`        | + Vote, save favorites                           |
| `admin`       | + Create/edit POIs, moderate photos, pin, verify |
| `super_admin` | + Manage vocabularies, kill switches, user roles |

### **8.2 Implementation**

- Supabase Auth with Google OAuth
- RLS policies based on `auth.jwt() ->> 'role'`
- No login required to browse (frictionless entry)

---

## **9. API Design**

### **9.1 Versioning**

- URL-based: `/api/v1/pois`, `/api/v1/photos`
- Breaking changes require new version

### **9.2 Key Endpoints**

```
GET    /api/v1/pois?bbox=...&filters=...
GET    /api/v1/pois/:id
POST   /api/v1/pois              (admin)
PATCH  /api/v1/pois/:id          (admin)

GET    /api/v1/pois/:id/photos
POST   /api/v1/photos            (user)
POST   /api/v1/photos/:id/vote   (user)
DELETE /api/v1/photos/:id        (admin)

POST   /api/v1/sync/queue        (offline sync)
GET    /api/v1/sync/conflicts    (conflict resolution)

POST   /api/admin/voting/toggle  (super_admin)
```

### **9.3 Rate Limiting**

- **MVP:** Open (no rate limiting)
- **Post-launch:** Implement 100 req/min per IP

---

## **10. Monetization Strategy (Future)**

> **MVP Focus:** Growth first, monetize later.

### **10.1 Potential Revenue Models**

| Model                      | Description                                                        | Priority          |
| -------------------------- | ------------------------------------------------------------------ | ----------------- |
| **Featured Placements**    | Venues pay for priority pins/top-of-list                           | High              |
| **Venue Claiming**         | Business owners claim & enhance their listing (freemium)           | High              |
| **Affiliate Reservations** | Commission on bookings via Tock/Resy links                         | Medium            |
| **Premium Filters**        | Advanced filters (e.g., "quiet zones", "fast WiFi") behind paywall | Medium            |
| **B2B Data Licensing**     | API access for travel apps, hotel concierges                       | Medium            |
| **Sponsored Collections**  | Curated lists sponsored by brands ("Best cafes by [Brand]")        | Low               |
| **Ads**                    | Non-intrusive banner ads on community feed                         | Low (last resort) |

### **10.2 Venue Claiming (Planned)**

- Email domain verification OR phone verification
- Claimed venues get: analytics, response to reviews, enhanced media

---

## **11. Launch Plan**

### **11.1 Timeline**

- **Month 1-2:** Admin team seeds 500 verified POIs
- **Target:** ~8-9 POIs per Scout per day
- **Regions:** Canggu, Ubud (Bali) + Senopati/SCBD (Jakarta)

### **11.2 Data Quality Requirements**

Every seeded POI must have:

- ✅ GPS location
- ✅ Open hours
- ✅ WiFi status
- ✅ At least 1 admin photo

### **11.3 Success Metrics (KPIs)**

| Metric                      | Target          | Timeline            |
| --------------------------- | --------------- | ------------------- |
| Hero images with score > 10 | 80% of POIs     | 1 month post-launch |
| Users using 2+ filters      | 40% of sessions | Ongoing             |
| Scout POI creation time     | < 180 seconds   | Ongoing             |
| 7-day retention             | 20%             | Ongoing             |

---

## **12. Out of Scope (v1.0.1)**

- ❌ In-app table booking (links only)
- ❌ User-generated POIs
- ❌ AI recommendation engine
- ❌ Direct messaging
- ❌ Venue claiming/verification
- ❌ B2B API licensing
- ❌ Custom Mapbox Studio styles
- ❌ Vote manipulation prevention (beyond basic auth)

---

## **13. Schema Migration & DevOps**

### **13.1 Migrations**

- **Tool:** Prisma Migrate
- Versioned migrations in `/prisma/migrations`

### **13.2 Observability Stack**

| Component  | Tool             |
| ---------- | ---------------- |
| Logs       | Loki             |
| Metrics    | Mimir/Prometheus |
| Traces     | Tempo            |
| Dashboards | Grafana          |

---

## **14. Appendix: i18n Keys Structure**

```json
{
	"category": {
		"cafe": { "en": "Cafe", "id": "Kafe" },
		"restaurant": { "en": "Restaurant", "id": "Restoran" }
	},
	"amenity": {
		"wifi": { "en": "WiFi", "id": "WiFi" },
		"power_outlets": { "en": "Power Outlets", "id": "Stop Kontak" }
	},
	"food": {
		"halal": { "en": "Halal", "id": "Halal" },
		"vegan": { "en": "Vegan", "id": "Vegan" }
	}
}
```

---

_Document generated from PRD interview session. All decisions represent stakeholder input as of 2026-01-01._
