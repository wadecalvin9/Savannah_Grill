# Savannah Grill 🥩🍔

Savannah Grill is a full-featured, cross-platform (iOS, Android, and Web) food ordering and delivery application built with **Expo (SDK 57)**, **React Native**, **Expo Router**, **NativeWind v4 (Tailwind CSS)**, and **Appwrite Cloud Backend**.

The platform features role-based access control supporting **Customers**, **Kitchen Staff**, **Riders**, and **Administrators** with real-time order tracking, live status updates, menu customization, and dynamic management interfaces.

---

### 👤 Customer Experience
* **Guest browsing** – Explore the full menu without signing in. Login is only required when placing an order.
* **Role-based authentication** – Email & password auth via Appwrite with automatic role-based routing.
* **Interactive menu** – Browse categories, real-time search, filters, nutritional info, and detailed product pages with ratings.
* **Location picker** – Delivery address modal with popular Nairobi presets or custom entry.
* **Shopping cart & checkout** – Live totals, delivery fee logic, optional notes, and dual payment options:
  * **Pay now** (Paystack – card / M-Pesa / bank)
  * **Pay on delivery** (Cash on Delivery)
* **Payment window** – Unpaid Paystack orders remain payable for a limited time (default 45 minutes). After expiry the order is marked expired/cancelled and the “Pay now” button is removed.
* **Live order tracking** – Visual timeline (`Pending` → `Preparing` → `Ready` → `Out for Delivery` → `Delivered` → `Completed`).
* **Delivery confirmation code** – When the rider arrives, the customer sees a 4-digit code. The rider must enter the correct code (1-hour expiry) to complete the delivery.
* **Order history** – Clear list with payment status badges, “Pay now” for pending Paystack orders, track/confirm/cancel actions, and filter chips (All / Active / Completed / Cancelled).
* **Pending-orders badge** – Visible on the Orders tab (mobile bottom tabs + web top navbar).

### 👨‍🍳 Kitchen Staff
* Dedicated staff portal (mobile + web).
* Dashboard showing **Pending / Preparing / Ready** orders.
* Order history and order-detail status updates.
* Unpaid / expired Paystack orders are automatically hidden from the kitchen queue so only actionable orders appear.
* Web top navbar (Kitchen / History / Profile); floating bottom tabs on mobile.

### 🚴 Rider Delivery Portal
* Dashboard of ready-for-pickup orders.
* One-click accept → status becomes **Out for Delivery**.
* Active delivery screen with customer details, items, destination, and map.
* **I’ve Arrived – Get Code** flow:
  1. Rider generates a 4-digit confirmation code.
  2. Customer sees the code on their Orders screen.
  3. Rider enters the code (max 5 attempts, 1-hour expiry).
  4. Correct code immediately marks the order **Completed**.
* History of past deliveries and earnings view.
* Web top navbar + mobile floating tabs.

### 🛠️ Admin Management Portal
* Analytics dashboard (revenue, active orders, products, users).
* Full menu CRUD with image upload to Appwrite Storage.
* Order lifecycle control.
* User & role management (including **Make Staff**).

---

## 💳 Payments

| Method              | Behaviour                                                                 | Status values                          |
|---------------------|---------------------------------------------------------------------------|----------------------------------------|
| **Pay now** (Paystack) | Order created as `pending` → Paystack popup opens (works on mobile + web) | `pending` → `paid` / `expired`        |
| **Pay on delivery** | Order created as `awaiting_collection`                                    | `awaiting_collection`                  |

* Currency: **KES** (amounts stored in cents for Paystack).
* Payment window: configurable (currently 45 minutes). After expiry → `payment_status = expired` + order cancelled so the kitchen stays clean.
* Customers can retry payment from the Orders screen while the window is still open.
* Platform-aware Paystack launch (native WebView on mobile, official InlineJS popup on web).

---

## 🏗️ Tech Stack & Architecture

| Category | Technology |
|---|---|
| **Framework** | [Expo (SDK 57)](https://expo.dev) / React Native 0.86 |
| **Routing** | [Expo Router v57](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) / Tailwind CSS 3.4 |
| **Backend & Auth** | [Appwrite Cloud](https://appwrite.io/) (Auth, Databases, Storage Buckets, Avatars) |
| **State Management** | React Context (`GlobalProvider`) with 12s polling interval for multi-role sync |
| **Web Platform** | React Native Web 0.21, Custom Web `Alert.alert` Polyfill |
| **Maps & Location** | `react-native-maps` / Interactive web map fallback |

---

## 📁 Directory Structure

```
Savannah_Grill/
├── assets/                          # Fonts (Quicksand), icons, images & splash assets
├── components/                      # Reusable UI components
│   ├── Cartbutton.jsx               # Cart icon with live item-count badge
│   ├── CustomButton.jsx             # Styled primary button with loading state
│   ├── CustomInput.jsx              # Form input with password visibility toggle
│   ├── LocationModal.jsx            # Delivery address picker (Nairobi presets + custom)
│   ├── MenuCard.jsx                 # Food item card used on home & search
│   ├── RiderMapView.jsx             # Map component for active rider deliveries
│   ├── WebFooter.jsx                # Footer shown on web layout
│   └── WebNavbar.jsx                # Sticky top navbar for web (logo, links, cart & pending-orders badges)
├── constants/
│   └── index.ts                     # Shared images, icons and constant values
├── lib/
│   ├── alertPolyfill.js             # Makes Alert.alert work correctly on web
│   ├── appwrite.js                  # Appwrite client + all helpers (orders, payments, confirmation codes, staff/rider queries)
│   ├── data.js                      # Static / seed data helpers
│   ├── paystack.js                  # Platform-aware Paystack launcher (mobile WebView + web InlineJS)
│   └── seed.ts                      # Database seeding utility
├── src/
│   ├── app/                         # Expo Router file-based routes
│   │   ├── _layout.tsx              # Root layout (fonts, PaystackProvider, GlobalProvider, web setup)
│   │   ├── index.jsx                # Entry point – role-based redirect
│   │   ├── globals.css              # Global styles
│   │   ├── (auth)/                  # Authentication group
│   │   │   ├── _layout.jsx
│   │   │   ├── sign-in.jsx          # Login screen
│   │   │   └── sign-up.jsx          # Registration screen
│   │   ├── (tabs)/                  # Customer bottom-tab navigation
│   │   │   ├── _layout.jsx          # Floating tab bar (mobile) + web layout
│   │   │   ├── index.jsx            # Home – categories & featured items
│   │   │   ├── search.jsx           # Menu search & filters
│   │   │   ├── cart.jsx             # Cart + checkout (Paystack / COD)
│   │   │   ├── orders.jsx           # Order history, Pay now, confirmation code display
│   │   │   └── profile.jsx          # Profile, location & sign-out
│   │   ├── (staff)/                 # Kitchen staff portal
│   │   │   ├── _layout.jsx          # Staff layout (web top nav + mobile tabs)
│   │   │   ├── dashboard.jsx        # Pending / Preparing / Ready queue
│   │   │   ├── history.jsx          # Staff order history
│   │   │   ├── profile.jsx          # Staff profile & sign-out
│   │   │   └── order/[id].jsx       # Single order detail & status updates
│   │   ├── (rider)/                 # Rider portal
│   │   │   ├── _layout.jsx          # Rider layout (web top nav + mobile tabs)
│   │   │   ├── dashboard.jsx        # Available “Ready” orders
│   │   │   ├── active.jsx           # Active delivery + confirmation-code flow
│   │   │   ├── history.jsx          # Past deliveries & earnings
│   │   │   └── profile.jsx          # Rider profile & sign-out
│   │   ├── (admin)/                 # Admin management portal
│   │   │   ├── _layout.jsx
│   │   │   ├── dashboard.jsx        # Stats overview
│   │   │   ├── products.jsx         # Menu item list
│   │   │   ├── add-product.jsx      # Create new menu item
│   │   │   ├── edit-product.jsx     # Edit existing menu item
│   │   │   ├── orders.jsx           # Admin order management
│   │   │   └── users.jsx            # User list + role management (Make Staff, etc.)
│   │   ├── menu/[id].jsx            # Single menu-item detail & reviews
│   │   └── order-tracking/[id].jsx  # Live order timeline & tracking
│   └── context/
│       └── GlobalProvider.jsx       # Global state (auth, cart, orders, roles, polling, payments)
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel + NativeWind preset
├── metro.config.js                  # Metro bundler config
├── tailwind.config.js               # Tailwind / NativeWind theme
├── package.json
└── README.md
```

---

## 🛠️ Installation & Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on mobile OR an Android/iOS emulator / Web Browser

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/wadecalvin9/Savannah_Grill.git
cd Savannah_Grill
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
EXPO_PUBLIC_APPWRITE_PROJECT_ID="6a5fb194003b1fdc4174"
EXPO_PUBLIC_APPWRITE_PROJECT_NAME="Savannah Grill"
```

### 3. Run the Application

#### Start Metro Development Server
```bash
npx expo start
```

#### Run on Web
```bash
npx expo start --web
```

#### Run on Android / iOS
```bash
# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## 🔑 User Roles & Testing Accounts

You can test different user experiences by logging in with different roles:

| Role | Access Level | Navigates To |
|---|---|---|
| **Customer** | Menu browsing, cart, ordering, tracking, user profile, Guest Browsing allowed | `/(tabs)` |
| **Staff** | Receives orders, prepares orders, Marks orders as completed | `/(staff)/dashboard` |
| **Rider** | Accepting deliveries, active delivery map, Confirmation-code handover flow | earnings history | `/(rider)/dashboard` |
| **Admin** | Business stats, CRUD menu items, order status stepper, user roles | `/admin` |

*Note: New sign-ups default to the `Customer` role. You can promote any account to `Rider`, `Staff` or `Admin` via the Admin Users page (`/admin/users`).*

---

## 🌐 Web Compatibility & Fixes
The project is optimized for both mobile and web browsers:
- **Responsive Layout Reset**: Base styling includes container height resets (`html, body, #root`) ensuring full-height flex layouts render properly across desktop and mobile browsers.
- **Cross-Platform Alert Polyfill**: Native `Alert.alert` calls are polyfilled on web using `window.alert` and `window.confirm` to ensure confirmation buttons (Checkout, Delete, Sign Out, Accept Delivery) function seamlessly across browsers.
- **Paystack** works on both platforms (WebView on native, InlineJS popup on web).
- **Guest state** is fully cleared on sign-out (no leftover orders).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
