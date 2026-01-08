# POI Creation Attributes

This document provides a comprehensive list of all attributes used in the POI (Point of Interest) creation and editing process, including all available values and options for each attribute.

---

## Overview

The POI creation system consists of **8 tabs** with a total of **43 attributes** that capture detailed information about a location.

---

## 1. Profile & Visuals

**Purpose**: Core identity and visual representation of the POI.

### Attributes

| Attribute       | Type        | Description                             | Values/Options                                                                                                                                                                                                   |
| --------------- | ----------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`          | String      | Official name of the POI                | Free text (required)                                                                                                                                                                                             |
| `brandName`     | String      | Brand or franchise name (if applicable) | Free text (optional)                                                                                                                                                                                             |
| `categories`    | Array       | POI categories/tags for classification  | **Options:**<br>• `category.cafe` - Cafe<br>• `category.restaurant` - Restaurant<br>• `category.coworking` - Coworking<br>• `category.bar` - Bar<br>• `category.park` - Park<br><br>_Multiple selection allowed_ |
| `description`   | Text        | Detailed description of the POI         | Free text, max 2000 characters                                                                                                                                                                                   |
| `coverImage`    | Image       | Main cover/hero image                   | Image upload (16:9 recommended)                                                                                                                                                                                  |
| `galleryImages` | Image Array | Additional gallery images               | Up to 10 images                                                                                                                                                                                                  |

---

## 2. Location

**Purpose**: Physical location and accessibility information.

### Attributes

| Attribute              | Type    | Description                          | Values/Options                                                                                                                |
| ---------------------- | ------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `address`              | String  | Full street address                  | Free text with autocomplete suggestions                                                                                       |
| `floorUnit`            | String  | Floor number and/or unit number      | Free text (optional)                                                                                                          |
| `latitude`             | Number  | Geographic latitude coordinate       | Decimal degrees                                                                                                               |
| `longitude`            | Number  | Geographic longitude coordinate      | Decimal degrees                                                                                                               |
| `publicTransport`      | Text    | Public transportation access details | Free text (e.g., "5 min walk from Central Station")                                                                           |
| `parkingOptions`       | Array   | Parking availability and options     | **Options:**<br>• `car` - Car Parking<br>• `motorcycle` - Motorcycle<br>• `valet` - Valet<br><br>_Multiple selection allowed_ |
| `wheelchairAccessible` | Boolean | Wheelchair accessibility status      | `true` / `false`                                                                                                              |

---

## 3. Work & Productivity

**Purpose**: Attributes relevant for remote work and productivity.

### Attributes

| Attribute        | Type    | Description                    | Values/Options                                                                                                                                                                                                      |
| ---------------- | ------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wifiQuality`    | String  | WiFi connection quality rating | **Options:**<br>• `none` - None<br>• `slow` - Slow<br>• `moderate` - Moderate<br>• `fast` - Fast<br>• `excellent` - Excellent                                                                                       |
| `powerOutlets`   | String  | Power outlet availability      | **Options:**<br>• `none` - None<br>• `limited` - Limited<br>• `moderate` - Moderate<br>• `plenty` - Plenty                                                                                                          |
| `seatingOptions` | Array   | Types of seating available     | **Options:**<br>• `ergonomic` - Ergonomic Chairs<br>• `communal` - Communal Tables<br>• `high-tops` - High-tops<br>• `outdoor` - Outdoor<br>• `private-booths` - Private Booths<br><br>_Multiple selection allowed_ |
| `noiseLevel`     | String  | Ambient noise level rating     | **Options:**<br>• `silent` - Silent<br>• `quiet` - Quiet<br>• `moderate` - Moderate<br>• `lively` - Lively<br>• `loud` - Loud                                                                                       |
| `hasAC`          | Boolean | Air conditioning availability  | `true` / `false`                                                                                                                                                                                                    |

---

## 4. Atmosphere

**Purpose**: Ambiance and environmental characteristics.

### Attributes

| Attribute     | Type   | Description                      | Values/Options                                                                                                                                                                                                                  |
| ------------- | ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vibes`       | Array  | Overall atmosphere and vibe tags | **Options:**<br>• `industrial` - Industrial<br>• `cozy` - Cozy<br>• `tropical` - Tropical<br>• `minimalist` - Minimalist<br>• `luxury` - Luxury<br>• `retro` - Retro<br>• `nature` - Nature<br><br>_Multiple selection allowed_ |
| `crowdType`   | Array  | Typical crowd demographics       | **Options:**<br>• `students` - Students<br>• `professionals` - Professionals<br>• `families` - Families<br>• `tourists` - Tourists<br>• `locals` - Locals<br>• `mixed` - Mixed<br><br>_Multiple selection allowed_              |
| `lighting`    | String | Lighting conditions              | **Options:**<br>• `bright` - Bright<br>• `moderate` - Moderate<br>• `dim` - Dim<br>• `natural` - Natural                                                                                                                        |
| `musicType`   | String | Type of music played             | Free text                                                                                                                                                                                                                       |
| `cleanliness` | String | Cleanliness rating               | **Options:**<br>• `poor` - Poor<br>• `average` - Average<br>• `clean` - Clean<br>• `spotless` - Spotless                                                                                                                        |

---

## 5. Food & Drink

**Purpose**: Culinary offerings and pricing.

### Attributes

| Attribute        | Type   | Description                          | Values/Options                                                                                                                                                                      |
| ---------------- | ------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cuisine`        | String | Type of cuisine offered              | **Options:**<br>• `italian` - Italian<br>• `japanese` - Japanese<br>• `fusion` - Fusion<br>• `streetfood` - Street Food<br>• `cafe` - Cafe<br>• `dessert` - Dessert                 |
| `priceRange`     | Number | Price range indicator                | **Options:**<br>• `1` - $ (Budget)<br>• `2` - $$ (Moderate)<br>• `3` - $$$ (Expensive)<br>• `4` - $$$$ (Very Expensive)                                                             |
| `dietaryOptions` | Array  | Dietary accommodations               | **Options:**<br>• `vegan` - Vegan<br>• `vegetarian` - Vegetarian<br>• `halal` - Halal<br>• `glutenfree` - Gluten-Free<br>• `nutfree` - Nut-Free<br><br>_Multiple selection allowed_ |
| `featuredItems`  | Array  | Signature or featured menu items     | Comma-separated list (e.g., "Truffle Fries, Wagyu Burger, Tiramisu")                                                                                                                |
| `specials`       | Array  | Special offers, deals, or promotions | Comma-separated list (e.g., "Monday: Half-price pasta, Weekend: Brunch buffet")                                                                                                     |

---

## 6. Operations

**Purpose**: Operating hours and service logistics.

### Attributes

| Attribute             | Type    | Description                         | Values/Options                                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | ------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openHours`           | Object  | Operating hours by day of week      | **Structure:**<br>`json<br>{<br>  "monday": { "open": "09:00", "close": "17:00" },<br>  "tuesday": { "open": "09:00", "close": "17:00" },<br>  ...<br>}<br>`<br><br>**Days:**<br>• `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`<br><br>Each day can be:<br>• Open with time range (HH:MM format)<br>• Closed (omit from object) |
| `reservationRequired` | Boolean | Whether reservations are required   | `true` / `false`                                                                                                                                                                                                                                                                                                                                                |
| `reservationPlatform` | String  | Platform or method for reservations | URL (e.g., OpenTable, Resy, Ticketmaster)                                                                                                                                                                                                                                                                                                                       |
| `paymentOptions`      | Array   | Accepted payment methods            | **Options:**<br>• `cash` - Cash<br>• `credit_card` - Credit Card<br>• `debit_card` - Debit Card<br>• `qris` - QRIS<br>• `gopay` - GoPay<br>• `ovo` - OVO<br><br>_Multiple selection allowed_                                                                                                                                                                    |
| `waitTimeEstimate`    | Number  | Typical wait time estimate          | Number in minutes (e.g., 15)                                                                                                                                                                                                                                                                                                                                    |

---

## 7. Social & Lifestyle

**Purpose**: Social policies and lifestyle accommodations.

### Attributes

| Attribute        | Type    | Description                            | Values/Options                                                        |
| ---------------- | ------- | -------------------------------------- | --------------------------------------------------------------------- |
| `kidsFriendly`   | Boolean | Kid-friendly status                    | `true` / `false`                                                      |
| `petFriendly`    | Boolean | Pet-friendly status                    | `true` / `false`                                                      |
| `petPolicy`      | Text    | Detailed pet policy information        | Free text (e.g., "Dogs allowed on patio only")                        |
| `smokerFriendly` | Boolean | Smoking accommodation status           | `true` / `false`                                                      |
| `happyHourInfo`  | Text    | Happy hour details and timing          | Free text (e.g., "5-7pm daily, 50% off drinks")                       |
| `loyaltyProgram` | Text    | Loyalty or rewards program information | Free text (e.g., "Earn 1 point per $10 spent, redeem for free items") |

---

## 8. Contact

**Purpose**: Contact information and online presence.

### Attributes

| Attribute     | Type   | Description                | Values/Options                                                                                                                                                                                                                                                                                                                     |
| ------------- | ------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phone`       | String | Contact phone number       | Phone number format (e.g., "+1 (555) 000-0000")                                                                                                                                                                                                                                                                                    |
| `email`       | String | Contact email address      | Email format                                                                                                                                                                                                                                                                                                                       |
| `website`     | URL    | Official website URL       | URL format (e.g., "https://www.example.com")                                                                                                                                                                                                                                                                                       |
| `socialLinks` | Object | Social media profile links | **Platforms:**<br>• `instagram` - Instagram<br>• `facebook` - Facebook<br>• `twitter` - X (Twitter)<br>• `tiktok` - TikTok<br>• `youtube` - YouTube<br>• `linkedin` - LinkedIn<br><br>**Format:**<br>`json<br>{<br>  "instagram": "https://instagram.com/handle",<br>  "facebook": "https://facebook.com/page",<br>  ...<br>}<br>` |

---

## Field-to-Tab Mapping

For validation and navigation purposes, each field is mapped to its corresponding tab:

```typescript
const FIELD_TO_TAB: Record<string, Tab> = {
	// Profile & Visuals
	name: "profile",
	brandName: "profile",
	categories: "profile",
	description: "profile",
	coverImage: "profile",
	galleryImages: "profile",

	// Location
	address: "location",
	floorUnit: "location",
	latitude: "location",
	longitude: "location",
	publicTransport: "location",
	parkingOptions: "location",
	wheelchairAccessible: "location",

	// Work & Prod
	wifiQuality: "workprod",
	powerOutlets: "workprod",
	seatingOptions: "workprod",
	noiseLevel: "workprod",
	hasAC: "workprod",

	// Atmosphere
	vibes: "atmosphere",
	crowdType: "atmosphere",
	lighting: "atmosphere",
	musicType: "atmosphere",
	cleanliness: "atmosphere",

	// Food & Drink
	cuisine: "fooddrink",
	priceRange: "fooddrink",
	dietaryOptions: "fooddrink",
	featuredItems: "fooddrink",
	specials: "fooddrink",

	// Operations
	openHours: "operations",
	reservationRequired: "operations",
	reservationPlatform: "operations",
	paymentOptions: "operations",
	waitTimeEstimate: "operations",

	// Social & Lifestyle
	kidsFriendly: "social",
	petFriendly: "social",
	petPolicy: "social",
	smokerFriendly: "social",
	happyHourInfo: "social",
	loyaltyProgram: "social",

	// Contact
	phone: "contact",
	email: "contact",
	website: "contact",
	socialLinks: "contact",
};
```

---

## Tab Navigation Order

1. **Profile & Visuals** - Core identity
2. **Location** - Where to find it
3. **Work & Prod** - Productivity features
4. **Atmosphere** - Ambiance details
5. **Food & Drink** - Culinary offerings
6. **Operations** - Hours and logistics
7. **Social & Lifestyle** - Policies and accommodations
8. **Contact** - How to reach them

---

## Validation Rules

### Required Fields

- `name` - POI name is required
- `categories` - At least one category must be selected
- `cuisine` - Required for food & drink establishments

### Optional Fields

All other fields are optional but recommended for a complete POI profile.

### Field Constraints

- `description` - Maximum 2000 characters
- `galleryImages` - Maximum 10 images
- `coverImage` - 16:9 aspect ratio recommended
- `priceRange` - Must be 1-4
- `waitTimeEstimate` - Positive number in minutes

---

## Notes

- All tabs support auto-save functionality in edit mode
- Validation errors automatically navigate to the relevant tab
- The system supports both "create" and "edit" modes
- Draft saving is available at any stage of completion
- Map location can be set by:
  - Clicking on the map
  - Dragging the marker
  - Using current location
  - Searching for an address
