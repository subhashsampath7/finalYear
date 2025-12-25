# Google Ads Transparency Extension Platform

A comprehensive platform for managing Google Ads Transparency Chrome Extension licenses with user management, KYC verification, payment processing, and admin panel.

## 🚀 Features

### User Features
- **Google Authentication** - Secure sign-in with Firebase
- **Profile Management** - Complete user profile (locked after submission)
- **KYC Verification** - Identity verification with NIC/Passport/Driving License
- **License Purchase** - Multiple pricing plans (1, 3, 12 months)
- **Payment Options** - Online payment (demo) and bank transfer
- **Discount Codes** - Apply discount codes during purchase
- **License Management** - View and manage active licenses
- **Email Notifications** - Automated emails for all actions
- **Expiry Reminders** - Automatic reminders 5 days before expiry

### Admin Features
- **Dashboard** - Overview statistics and metrics
- **User Management** - View and manage all users
- **KYC Review** - Approve/decline KYC verifications
- **Payment Review** - Approve/decline payments
- **License Management** - View all licenses and expiry dates
- **Pricing Management** - Update pricing plans
- **Discount Codes** - Create and manage discount codes
- **Telegram Notifications** - Real-time notifications for KYC and payments

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Firebase Account (for Google Auth)
- Gmail Account (for email service)
- Telegram Bot (optional, for notifications)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd google-ads-transparency-platform
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
source database/schema.sql
```

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Backend .env Configuration:**

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=google_ads_transparency
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Google Ads Transparency <noreply@example.com>

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Admin
ADMIN_DEFAULT_PASSWORD=admin123
```

**Start Backend:**

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

**Configure Firebase (src/services/firebase.js):**

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Start Frontend:**

```bash
npm run dev
```

### 5. Admin Panel Setup

```bash
cd admin
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start Admin Panel
npm run dev
```

## 🔑 Default Admin Credentials

```
Username: admin
Password: admin123
```

## 📱 Access URLs

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🔧 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication in Authentication > Sign-in method
4. Add web app and copy configuration

### 2. Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Extract values for .env:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## 📧 Email Setup (Gmail)

### 1. Enable 2-Factor Authentication

1. Go to Google Account Settings
2. Security > 2-Step Verification
3. Enable 2FA

### 2. Generate App Password

1. Security > App passwords
2. Select "Mail" and "Other"
3. Generate password
4. Use this password in `EMAIL_PASSWORD`

## 🤖 Telegram Bot Setup (Optional)

### 1. Create Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions
4. Copy bot token → `TELEGRAM_BOT_TOKEN`

### 2. Get Chat ID

1. Message your bot
2. Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Find `chat.id` → `TELEGRAM_CHAT_ID`

## 📊 Database Schema

### Tables

- **users** - User accounts and profiles
- **kyc_verifications** - KYC submissions and status
- **pricing_plans** - Subscription plans
- **discount_codes** - Promotional codes
- **payments** - Payment records
- **licenses** - License keys and expiry
- **admin_users** - Admin accounts
- **notifications** - System notifications
- **audit_logs** - Admin action logs

## 🔄 Workflow

### User Journey

1. **Registration** → Sign up with Google
2. **Profile** → Complete profile (name, address, DOB, etc.)
3. **KYC** → Submit identity documents
4. **Wait** → Admin reviews and approves KYC
5. **Purchase** → Select plan and make payment
6. **Payment Review** → Admin approves payment
7. **License** → Receive license key via email
8. **Activate** → Use key in Chrome extension

### Admin Workflow

1. **Login** → Access admin panel
2. **KYC Review** → View documents and approve/decline
3. **Payment Review** → Verify payments and approve
4. **License Generation** → System auto-generates on approval
5. **Management** → Monitor users, licenses, revenue

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User
- `PUT /api/user/profile` - Update profile
- `GET /api/user/dashboard` - Get dashboard data

### KYC
- `POST /api/kyc/submit` - Submit KYC
- `GET /api/kyc/status` - Get KYC status

### Payment
- `GET /api/payment/plans` - Get pricing plans
- `POST /api/payment/validate-discount` - Validate discount code
- `POST /api/payment/create` - Create payment
- `POST /api/payment/upload-proof` - Upload payment proof
- `POST /api/payment/process-online` - Process online payment

### License
- `POST /api/license/activation` - Activate license (extension)
- `GET /api/license/my-licenses` - Get user licenses

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/kyc/pending` - Pending KYC
- `POST /api/admin/kyc/review` - Review KYC
- `GET /api/admin/payments` - All payments
- `POST /api/admin/payments/review` - Review payment
- `GET /api/admin/licenses` - All licenses
- `PUT /api/admin/pricing/update` - Update pricing
- `POST /api/admin/discount-codes/create` - Create discount code

## 🔐 Security Features

- JWT authentication
- Firebase authentication
- Password hashing (bcrypt)
- File upload validation
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

## 📝 License Key Format

```
XXXX-XXXX-XXXX-XXXX
```

- 16 characters (alphanumeric)
- Unique per user per purchase
- Auto-expires based on plan duration

## 🔔 Automated Features

### Cron Jobs

- **License Expiry Check** - Runs hourly
- **Expiry Reminders** - Sends email 5 days before expiry
- **Status Updates** - Auto-updates expired licenses

### Email Notifications

- Welcome email on registration
- KYC status updates
- Payment confirmations
- License key delivery
- Expiry reminders
- Payment failures

### Telegram Notifications

- New KYC submissions
- New payment received
- Admin actions required

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env
# Test connection
mysql -u root -p -e "SHOW DATABASES;"
```

### Firebase Authentication Error

- Verify Firebase config in frontend
- Check Firebase Admin SDK credentials in backend
- Ensure Google Auth is enabled in Firebase Console

### Email Not Sending

- Verify Gmail App Password
- Check 2FA is enabled
- Test SMTP connection
- Check spam folder

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

## 📦 Production Deployment

### Backend

```bash
cd backend
npm run build
NODE_ENV=production node src/server.js
```

### Frontend

```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting
```

### Admin

```bash
cd admin
npm run build
# Deploy dist/ folder to hosting
```

### Environment Variables

- Update all URLs to production domains
- Use strong JWT secret
- Enable HTTPS
- Configure production database
- Set up backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@example.com or create an issue in the repository.

## 🎉 Acknowledgments

- Vue.js team for the amazing framework
- Tailwind CSS for utility-first CSS
- Firebase for authentication
- Express.js for backend framework
- MySQL for database

---

**Built with ❤️ for Google Ads Transparency**