# Savannah Grill 🥩🍔

Savannah Grill is a full-featured, cross-platform (iOS, Android, and Web) food ordering and delivery application built with **Expo (SDK 57)**, **React Native**, **Expo Router**, **NativeWind v4 (Tailwind CSS)**, and **Appwrite Cloud Backend**.

The platform features role-based access control supporting **Customers**, **Riders**, and **Administrators** with real-time order tracking, live status updates, menu customization, and dynamic management interfaces.

---

## 📸 Overview & Key Features

### 👤 Customer Experience
* **Role-Based Authentication**: Email & password authentication powered by Appwrite. Automatic role-based routing on login (`Customer`, `Rider`, `Admin`).
* **Interactive Menu Exploration**: Browse categories (Burgers, Steaks, Drinks, Sides, Desserts), search food items in real-time, filter by tags, and view calorie/protein nutritional specs.
* **Detailed Product Views**: Full product details including high-res image header, rating submission system, price calculations, quantity adjustments, and category recommendation carousels.
* **Location Picker**: Interactive delivery address modal with popular Nairobi presets (Karen, Westlands, Kilimani, Lavington, CBD, etc.) or custom user entry.
* **Shopping Cart & Checkout**: Add items, adjust item quantities with live subtotal/delivery fee calculation, append optional chef instructions, and place orders directly to the database.
* **Live Order Tracking**: Visual 5-stage timeline progress indicator (`Pending` → `Preparing` → `Ready` → `Out for Delivery` → `Completed`) with live order status updates and delivery map views.
* **Order History**: Review past orders, inspect itemized totals, and check fulfillment statuses.

### 🚴 Rider Delivery Portal
* **Delivery Dashboard**: View all ready-for-pickup orders across the kitchen in real-time.
* **One-Click Acceptance**: Accept available delivery assignments to start fulfillment.
* **Active Delivery View**: Dedicated active navigation screen featuring customer address details, special delivery instructions, and live route mapping (`RiderMapView`).
* **Delivery Completion**: Mark orders as completed upon arrival.
* **Earnings & Delivery History**: Track past completed deliveries, total trips, and total earnings.

### 🛠️ Admin Management Portal
* **Analytics Dashboard**: Overview of key business metrics (Total Revenue, Active Orders, Total Products, Registered Accounts) alongside recent order feeds.
* **Menu Item Management**: Full CRUD capabilities for food items—add new menu items, edit descriptions, change pricing, upload product images to Appwrite Storage, and delete items.
* **Image Upload Integration**: Upload food images directly from mobile device gallery or web file system to Appwrite Storage with fallback sample image presets.
* **Order Lifecycle Control**: Real-time management of customer order statuses through kitchen stages (`Preparing` → `Ready` → `Out for Delivery` → `Completed` → `Cancelled`).
* **User & Role Management**: View all registered accounts and switch user roles dynamically (`customer` ↔ `rider` ↔ `admin`).

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
├── assets/                     # Fonts (Quicksand), icons, and graphics
├── components/                 # Reusable UI Components
│   ├── Cartbutton.jsx          # Cart icon with dynamic item count badge
│   ├── CustomButton.jsx        # Styled action button with loading indicator
│   ├── CustomInput.jsx         # Form text input with password toggle
│   ├── LocationModal.jsx       # Delivery location selection modal
│   ├── MenuCard.jsx            # Food item card component
│   └── RiderMapView.jsx        # Interactive delivery map component
├── lib/
│   ├── appwrite.js             # Appwrite SDK client setup & API methods
│   └── alertPolyfill.js        # Cross-platform web Alert.alert polyfill
├── src/
│   ├── app/                    # Expo Router file-based pages
│   │   ├── _layout.tsx         # Root layout, fonts loading & web alert setup
│   │   ├── index.jsx           # Entry redirect logic
│   │   ├── (auth)/             # Authentication Screens
│   │   │   ├── _layout.jsx     # Auth graphical layout wrapper
│   │   │   ├── sign-in.jsx     # Login screen
│   │   │   └── sign-up.jsx     # Account registration screen
│   │   ├── (tabs)/             # Customer Main Navigation (Tab Bar)
│   │   │   ├── _layout.jsx     # Floating bottom tab bar
│   │   │   ├── index.jsx       # Customer Home screen & category feed
│   │   │   ├── search.jsx      # Menu search & filters
│   │   │   ├── cart.jsx        # Shopping cart & checkout flow
│   │   │   ├── orders.jsx      # Customer order history
│   │   │   └── profile.jsx     # User profile & location manager
│   │   ├── (rider)/            # Rider Portal Screens
│   │   │   ├── _layout.jsx     # Rider bottom tabs layout
│   │   │   ├── dashboard.jsx   # Available deliveries queue
│   │   │   ├── active.jsx      # Active delivery route & completion
│   │   │   ├── history.jsx     # Rider delivery history & earnings
│   │   │   └── profile.jsx     # Rider profile & sign-out
│   │   ├── admin/              # Admin Management Screens
│   │   │   ├── index.jsx       # Admin dashboard & stats
│   │   │   ├── products.jsx    # Product list & management
│   │   │   ├── add-product.jsx # Create new food item form
│   │   │   ├── edit-product.jsx# Update existing food item form
│   │   │   ├── orders.jsx      # Admin order status manager
│   │   │   └── users.jsx       # Admin user role manager
│   │   ├── menu/[id].jsx       # Menu item detail & review page
│   │   └── order-tracking/[id].jsx # Order timeline tracking screen
│   └── context/
│       └── GlobalProvider.jsx  # Global state provider (Auth, Cart, Orders, Role)
├── app.json                    # Expo configuration
├── babel.config.js             # Babel config with NativeWind preset
├── metro.config.js             # Metro bundler config with NativeWind CSS plugin
└── tailwind.config.js          # Tailwind CSS theme & color definitions
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
| **Customer** | Menu browsing, cart, ordering, tracking, user profile | `/(tabs)` |
| **Rider** | Accepting deliveries, active delivery map, earnings history | `/(rider)/dashboard` |
| **Admin** | Business stats, CRUD menu items, order status stepper, user roles | `/admin` |

*Note: New sign-ups default to the `Customer` role. You can promote any account to `Rider` or `Admin` via the Admin Users page (`/admin/users`).*

---

## 🌐 Web Compatibility & Fixes
The project is optimized for both mobile and web browsers:
- **Responsive Layout Reset**: Base styling includes container height resets (`html, body, #root`) ensuring full-height flex layouts render properly across desktop and mobile browsers.
- **Cross-Platform Alert Polyfill**: Native `Alert.alert` calls are polyfilled on web using `window.alert` and `window.confirm` to ensure confirmation buttons (Checkout, Delete, Sign Out, Accept Delivery) function seamlessly across browsers.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
