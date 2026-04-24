# KK Events & Water Plant - Delivery System

## 🚀 Complete Android App for Water Can Delivery Management

### Features
- ✅ Customer Management with GPS Location
- ✅ Multi-trip Delivery System (Normal + Cool Cans)
- ✅ Split-Screen Active Delivery (Map + Customer List)
- ✅ Swipe-to-Deliver Actions
- ✅ Auto Billing on Delivery
- ✅ Payment Recording (Cash/UPI/Bank)
- ✅ Auto Bill Clearance
- ✅ Daily & Monthly Reports
- ✅ WhatsApp Report Sharing
- ✅ Route Optimization (with Google Maps)
- ✅ Delivery Timestamps per Customer

---

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Android phone for testing
- Expo Go app (for development) or EAS account (for APK)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (Free M0 tier)
3. Create a database user with password
4. Get your connection string
5. Create `backend/.env` file:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/kk-waterplant?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### Step 3: Start Backend Server
```bash
cd backend
npm run dev
```
Server will start at `http://localhost:5000`

### Step 4: Install Mobile App Dependencies
```bash
cd mobile
npm install
```

### Step 5: Setup Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Directions API
4. Create an API key
5. Edit `mobile/app.json` and replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your key

### Step 6: Configure API URL
Edit `mobile/src/theme/index.js` and update `API_URL`:
```javascript
// For Android emulator:
API_URL: 'http://10.0.2.2:5000/api'

// For physical device (use your PC's IP):
API_URL: 'http://192.168.1.XXX:5000/api'
```

### Step 7: Run the App (Development)
```bash
cd mobile
npx expo start
```
- Press `a` to open on Android
- Or scan QR code with Expo Go app

### Step 8: Build APK (Production)
```bash
# Login to Expo
npx eas login

# Build APK
npx eas build --platform android --profile preview
```
This will generate an APK file you can install on any Android phone.

---

## 📱 App Structure

```
mobile/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/             # Tab screens
│   │   ├── index.js        # 🏠 Home Dashboard
│   │   ├── customers.js    # 👥 Customer List
│   │   ├── delivery.js     # 🚚 Delivery Hub
│   │   ├── billing.js      # 💰 Billing
│   │   └── reports.js      # 📊 Reports
│   ├── customer/           # Customer sub-screens
│   │   ├── add.js          # Add Customer
│   │   ├── [id].js         # Customer Detail
│   │   └── location.js     # GPS Location Picker
│   ├── delivery/           # Delivery sub-screens
│   │   ├── load-cans.js    # Load Cans + Select Customers
│   │   ├── active.js       # Split Screen (Map + List)
│   │   └── summary.js      # End-of-day Summary
│   └── billing/
│       └── payment.js      # Record Payment
├── src/
│   ├── components/         # Reusable components
│   ├── store/              # Zustand state management
│   ├── api/                # API client
│   └── theme/              # Design system
└── assets/                 # Icons, images

backend/
├── server.js               # Express server
├── models/                 # MongoDB schemas
│   ├── Customer.js
│   ├── Delivery.js
│   ├── Billing.js
│   └── DailyReport.js
└── routes/                 # API routes
    ├── customers.js
    ├── deliveries.js
    ├── billing.js
    └── reports.js
```

---

## 💰 Default Pricing
- Normal Can: ₹20
- Cool Can: ₹30
- (Customizable per customer)

---

## 📞 Support
Business: KK Events & Water Plant
