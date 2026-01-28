# Alerzo - Emergency Assistance App

An offline-first emergency assistance mobile application designed for rural and low-connectivity regions in India. Built with React Native (Expo).

## Features

### Authentication & Sync
- **User Accounts** - Register and login to sync your data across devices
- **Cloud Sync** - Emergency contacts are saved to your account
- **Secure** - Passwords are hashed and stored securely

### Core Emergency Features
- **One-Tap SOS Button** - Large red emergency button for instant alerts
- **GPS Location Sharing** - Automatically includes Google Maps link in SMS
- **Offline Mode Support** - Works without internet using SMS fallback
- **Emergency Categories** - Medical, Fire, Police, Kidnapping/Threat, Natural Disaster

### Trusted Contacts System
- Add up to **10 emergency contacts**
- Auto-message all contacts during SOS
- Pick contacts from phone or enter manually
- Synced across all your devices

### Multi-language Support
- English
- Hindi (हिंदी)
- Marathi (मराठी)

### Safety Features
- **Fake Call Mode** - Simulate incoming call to escape unsafe situations
- **Silent SOS** - Send alerts without sound or vibration
- **Siren Sound** - Optional loud siren on SOS activation
- **Power Saving Mode** - Reduce battery usage for emergencies

### Rural-Friendly UI
- Big buttons with high contrast
- Minimal text, easy navigation
- Optimized for low-end Android phones

## Privacy & Security
- Passwords securely hashed
- Data synced to your personal account only
- No data shared with third parties

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo Go app on your mobile device

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd rakshasos
```

2. Install dependencies
```bash
npm install
```

3. Push database schema
```bash
npm run db:push
```

4. Start the development servers
```bash
npm run server:dev  # Start Express backend
npm run expo:dev    # Start Expo dev server
```

5. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Usage

### Creating an Account
1. Open the app
2. Enter a username and password
3. Tap "Create Account" to register
4. Your account is now ready to use

### Sending an SOS Alert
1. Open the app to the Home screen
2. Select an emergency category (tap the category label)
3. Press and hold the big red SOS button for 1 second
4. The app will send SMS alerts to all your trusted contacts with your location

### Adding Emergency Contacts
1. Go to the Contacts tab
2. Tap the + button
3. Pick from your phone contacts or enter manually
4. Add up to 10 trusted contacts (synced across devices!)

### Using Fake Call
1. Go to Profile tab
2. Enable "Fake Call Mode"
3. Tap "Start Fake Call" to simulate an incoming call

### Changing Language
1. Go to Profile tab
2. Select your preferred language (English, Hindi, or Marathi)

## Tech Stack
- **Framework**: React Native with Expo
- **Backend**: Express.js with PostgreSQL
- **Database**: Drizzle ORM
- **Navigation**: React Navigation
- **Storage**: AsyncStorage (offline) + PostgreSQL (sync)
- **Location**: Expo Location API
- **SMS**: Expo SMS API
- **Animations**: React Native Reanimated
- **Icons**: Feather Icons

## Project Structure
```
client/
├── components/     # Reusable UI components
├── constants/      # Theme and styling constants
├── context/        # React Context (Auth, App)
├── hooks/          # Custom React hooks
├── lib/            # Utilities (storage, i18n, query)
├── navigation/     # Navigation configuration
└── screens/        # App screens

server/
├── db.ts           # Database connection
├── routes.ts       # API routes
├── storage.ts      # Database operations
└── index.ts        # Server entry point

shared/
└── schema.ts       # Drizzle database schema
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to existing account
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User Settings
- `PATCH /api/user/settings` - Update user preferences

### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `PATCH /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

## Permissions Required
- **Location** - To include GPS coordinates in SOS alerts
- **Contacts** - To pick emergency contacts from phone
- **SMS** - To send emergency SMS messages

## License
MIT License
