# Unified Operations Platform

A comprehensive web-based operations platform for service businesses to manage customer inquiries, bookings, communications, forms, and inventory from a single dashboard.

## 🚀 Features

- **Business Onboarding**: 8-step guided setup process
- **Dashboard**: Real-time metrics and alerts
- **Unified Inbox**: Email & SMS conversations in one place
- **Booking Management**: Calendar view with automated confirmations
- **Form Management**: Track and automate customer forms
- **Inventory Tracking**: Stock management with low-stock alerts
- **Team Management**: Role-based permissions for staff
- **Automation Engine**: Event-driven workflows with email/SMS triggers

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- SendGrid (Email)
- Twilio (SMS)
- JWT Authentication
- Real-time automation engine

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- SendGrid API key (for email)
- Twilio account (for SMS)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

### 1. Register & Onboarding

1. Visit `http://localhost:5173`
2. Click "Start Onboarding"
3. Complete the 8-step setup:
   - **Step 1**: Workspace details (business name, address, timezone)
   - **Step 2**: Email & SMS configuration (SendGrid + Twilio)
   - **Step 3**: Contact form setup
   - **Step 4**: Booking types configuration
   - **Step 5**: Forms setup
   - **Step 6**: Inventory setup
   - **Step 7**: Staff management
   - **Step 8**: Activate workspace

### 2. Dashboard

After activation, access the dashboard to:
- View today's bookings
- Monitor unread messages
- Track pending forms
- Check inventory alerts

### 3. Customer Flow (No Login)

Customers interact via:
- **Contact Form**: `http://localhost:5173/contact?workspace=WORKSPACE_ID`
- **Booking Page**: `http://localhost:5173/book?workspace=WORKSPACE_ID`
- **Form Submission**: Links sent via email/SMS

### 4. Automation Rules

The system automatically:
- Sends welcome messages to new contacts
- Confirms bookings via email/SMS
- Sends reminders 24h before appointments
- Alerts on low inventory
- Pauses automation when staff replies

## 🔐 Roles & Permissions

### Business Owner (Admin)
- Full access to all features
- Configure workspace settings
- Manage staff and permissions
- View all analytics

### Staff User
- Limited access based on permissions:
  - Inbox (if granted)
  - Bookings (if granted)
  - Forms (if granted)
  - Inventory (if granted)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register owner + workspace
- `POST /api/auth/login` - Login

### Onboarding
- `GET /api/onboarding/status` - Get current step
- `POST /api/onboarding/step1` - Update workspace details
- `POST /api/onboarding/step2` - Configure email/SMS
- `POST /api/onboarding/activate` - Activate workspace

### Dashboard
- `GET /api/dashboard/metrics` - Get metrics
- `GET /api/dashboard/alerts` - Get alerts

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings/public/:workspaceId` - Create booking (public)
- `PATCH /api/bookings/:id/status` - Update status

### Inbox
- `GET /api/inbox` - List conversations
- `POST /api/inbox/:id/messages` - Send message

### Forms
- `GET /api/forms/templates` - List templates
- `POST /api/forms/submit/:formId` - Submit form (public)

### Inventory
- `GET /api/inventory` - List items
- `PATCH /api/inventory/:id/quantity` - Update quantity

## 🤖 Automation Engine

The automation engine runs in real-time and checks for:

### Event-Based Triggers
- `contact_created` → Welcome message
- `booking_created` → Confirmation email
- `staff_reply` → Pause automation
- `inventory_low` → Alert
- `inventory_critical` → Critical alert

### Scheduled Checks (Every 1 minute)
- Booking reminders (24h before)
- Overdue form reminders (48h pending)

## 🧪 Testing

1. Start both backend and frontend
2. Register a new account
3. Complete onboarding with test SendGrid/Twilio credentials
4. Test public contact form submission
5. Test public booking creation
6. Verify automation triggers in backend logs

## 📝 Notes

- Customers never log in - all interactions via links
- Staff replies automatically pause automation
- All communication flows through configured integrations
- Inventory alerts trigger when below thresholds

## 🔧 Development

### Backend Structure
```
backend/
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── services/        # Business logic
├── middleware/      # Auth, permissions
└── server.js        # Express app
```

### Frontend Structure
```
src/react-app/
├── components/      # UI components
├── pages/           # Route pages
├── lib/             # API client, utils
└── App.tsx          # Router setup
```

## 🚧 Future Enhancements

- Calendar view for bookings
- Advanced analytics
- Multi-language support
- Mobile app
- Payment integration
- Advanced automation builder

## 📄 License

MIT
