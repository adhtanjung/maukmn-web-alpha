# **Product Requirements Document (PRD): Maukemana v1.0.1**

**Project:** Maukemana – The Hyper-Personalized Travel & Community Guide
**Version:** 1.0.1 (MVP)
**Status:** Ready for Development
**Tech Stack Focus:** PostgreSQL / PostGIS / Next.js / TailwindCSS / Mapbox

---

### **1. Executive Summary**

Maukemana is a discovery platform for Indonesia that replaces generic travel advice with hyper-granular, verified data and community-curated visuals. The MVP focuses on an **Admin-Led, Community-Refined** model: Admins "scout" and seed high-fidelity data, while the community uses a Reddit-style voting system to surface the best photos and experiences.

---

### **2. The Problem & Solution**

- **The Problem:** Platforms like Google Maps or TripAdvisor lack the nuance needed by modern travelers (e.g., "Which cafe has ergonomic chairs AND 50Mbps Wi-Fi?"). Information is often unverified and cluttered with low-quality photos.
- **The Solution:** A structured PostgreSQL database capturing 30+ granular attributes per POI (Point of Interest) combined with a "Reddit-like" photo curation engine where the highest-rated pictures define the venue’s visual identity.

---

### **3. User Personas**

1.  **The Scout (Admin):** Internal team members capturing location data, verified tags, and initial photos on-site.
2.  **The Enthusiast (Community User):** Travelers and locals who browse the map, filter by specific needs, and upvote/downvote photos to curate the "vibe" of a place.

---

### **4. Functional Requirements**

#### **4.1 The Admin "Scout" Tool (Mobile-First)**

- **Rapid Capture:** An interface designed for one-handed mobile use to add a new POI while physically present.
- **Auto-Location:** One-tap to fetch `GEOGRAPHY(Point)` coordinates via GPS.
- **Granular Entry:** A comprehensive form to populate the PostgreSQL schema (see Section 5).
- **Batch Media:** Native camera integration to take multiple photos; the system handles background uploads to a CDN (e.g., S3/Cloudinary).

#### **4.2 The Community Photo Engine (Reddit-style)**

- **Voting Logic:** Every photo has an `Upvote` and `Downvote` button.
- **Ranking:** The "Hero Image" of a POI is dynamically selected based on the highest `Score` (`Upvotes - Downvotes`).
- **Community Feed:** A scrollable "Community" page showing a live feed of the latest and top-rated photos across Indonesia.
- **Social Proof:** High-quality photos rise; blurry, dark, or irrelevant photos sink or get hidden.

#### **4.3 Discovery & Filtering**

- **Hyper-Filter:** Users can filter by any combination of the PostgreSQL attributes (e.g., `pet_friendly` + `outdoor_seating` + `has_wifi`).
- **Hybrid View:** Seamless toggle between a **Mapbox Map** (custom styled pins) and a **List View**.
- **Icon-Driven UI:** Detail pages use high-contrast icons to display amenities (⚡ for power, 📶 for wifi, 🚬 for smoker-friendly).

#### **4.4 Admin "God Mode"**

- **Contextual Overlays:** Admins use the same interface as users but see additional buttons (`Edit`, `Delete`, `Pin`).
- **Content Moderation:** Admins can delete any community photo or "Pin" a specific professional photo to the top, overriding the voting score.
- **Verification:** Admins can mark specific attributes as "Verified" (visually distinct from user-submitted info).

---

### **5. Technical Specifications (PostgreSQL Schema)**

The database must be optimized for geospatial queries and granular filtering.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE points_of_interest (
    poi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- e.g., 'Cafe', 'Coworking', 'Restaurant'
    website VARCHAR(100),
    brand VARCHAR(100),
    description TEXT,

    -- Geospatial
    address_id UUID REFERENCES address(address_id),
    location GEOGRAPHY(Point, 4326),
    parking_info TEXT,

    -- Amenities & Checklists
    amenities TEXT[], -- ['Ergonomic Chairs', 'Quiet Zone', 'Power Outlets']
    has_wifi BOOLEAN DEFAULT FALSE,
    outdoor_seating BOOLEAN DEFAULT FALSE,
    is_wheelchair_accessible BOOLEAN DEFAULT FALSE,
    has_delivery BOOLEAN DEFAULT FALSE,

    -- Food & Drink
    cuisine VARCHAR(100),
    price_range INTEGER, -- 1 to 4
    food_options VARCHAR(30)[], -- ['Vegan', 'Halal', 'Gluten-Free']
    featured_menu_items VARCHAR(50)[],
    specials VARCHAR(50)[],

    -- Logistics
    open_hours JSONB, -- { "mon": "08:00-22:00", ... }
    secondary_open_hours JSONB, -- For holiday/ramadan hours
    reservation_platform VARCHAR(100),
    reservation_required BOOLEAN DEFAULT FALSE,
    payment_options VARCHAR(20)[], -- ['Credit Card', 'QRIS', 'Cash']
    wait_time_estimate INTEGER, -- in minutes

    -- Lifestyle
    kids_friendly BOOLEAN DEFAULT FALSE,
    smoker_friendly BOOLEAN DEFAULT FALSE,
    pet_friendly VARCHAR(10)[], -- ['Dogs', 'Cats']

    -- Social & Events
    social_media_links JSONB, -- { "instagram": "@username", "tiktok": "..." }
    events VARCHAR(30)[], -- ['Live Music', 'Workshop']
    events_calendar JSONB,
    happy_hour_info TEXT,
    loyalty_program TEXT,

    -- Community Aggregates
    rating_avg DECIMAL(3, 2),
    reviews_count INTEGER DEFAULT 0,
    user_reviews JSONB[], -- Array of review objects

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE photos (
    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES points_of_interest(poi_id),
    user_id UUID,
    url TEXT NOT NULL,
    is_admin_official BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### **6. User Experience & Design Guidelines**

- **Visual Style:** "Liquid Glass" (Modern, clean, transparent layers over high-quality photography).
- **Frictionless Entry:** No login required to browse. Google OAuth 2.0 required only for voting or saving favorites.
- **Admin Speed:** The "Scout" form must use **Multi-select chips** and **Toggle switches** to minimize typing.
- **Voting Feedback:** Satisfying haptic feedback (on mobile) and animations when upvoting a photo.

---

### **7. Data Strategy (The Launch Blitz)**

- **Launch Regions:** Canggu & Ubud (Bali) and Senopati/SCBD (Jakarta).
- **Initial Seed:** The Admin team must verify **500 POIs** before the public launch.
- **Target Accuracy:** 100% of seeded POIs must include `location` (GPS), `open_hours`, and `has_wifi` status.

---

### **8. Success Metrics (KPIs)**

1.  **Curation Quality:** 80% of POIs have a "Hero Image" with a score of >10 within 1 month.
2.  **Filter Utility:** 40% of users use 2 or more granular filters during their search session.
3.  **Admin Efficiency:** Average time for a Scout to create a full POI entry is < 180 seconds.
4.  **Retention:** 20% of users return to the app within 7 days to check their "Saved" spots.

---

### **9. Out of Scope for v1.0.0**

- In-app table booking (Links only).
- User-generated POIs (Admin-only creation for data quality).
- Personalized AI recommendation engine.
- Direct messaging between users.
