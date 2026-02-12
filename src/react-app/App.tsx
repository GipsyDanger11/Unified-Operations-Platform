import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import OnboardingPage from "@/react-app/pages/Onboarding";
import DashboardPage from "@/react-app/pages/Dashboard";
import InboxPage from "@/react-app/pages/Inbox";
import BookingsPage from "@/react-app/pages/Bookings";
import FormsPage from "@/react-app/pages/Forms";
import InventoryPage from "@/react-app/pages/Inventory";
import TeamPage from "@/react-app/pages/Team";
import AutomationPage from "@/react-app/pages/Automation";
import SettingsPage from "@/react-app/pages/Settings";
import AppLayout from "@/react-app/components/AppLayout";

import PublicLayout from "@/react-app/components/PublicLayout";
import PublicContactPage from "@/react-app/pages/PublicContact";
import PublicBookingPage from "@/react-app/pages/PublicBooking";
import PublicFormPage from "@/react-app/pages/PublicForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Public Routes */}
        <Route path="/contact" element={<PublicLayout><PublicContactPage /></PublicLayout>} />
        <Route path="/book" element={<PublicLayout><PublicBookingPage /></PublicLayout>} />
        <Route path="/forms/public/:formId" element={<PublicLayout><PublicFormPage /></PublicLayout>} />

        {/* App Routes */}
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/inbox" element={<AppLayout><InboxPage /></AppLayout>} />
        <Route path="/bookings" element={<AppLayout><BookingsPage /></AppLayout>} />
        <Route path="/forms" element={<AppLayout><FormsPage /></AppLayout>} />
        <Route path="/inventory" element={<AppLayout><InventoryPage /></AppLayout>} />
        <Route path="/team" element={<AppLayout><TeamPage /></AppLayout>} />
        <Route path="/automation" element={<AppLayout><AutomationPage /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
      </Routes>
    </Router>
  );
}
