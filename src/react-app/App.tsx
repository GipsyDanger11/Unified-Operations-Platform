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
import ServicesPage from "./pages/Services";
import Chatbot from "@/react-app/components/Chatbot";
import AppLayout from "@/react-app/components/AppLayout";

import PublicLayout from "@/react-app/components/PublicLayout";
import PublicContactPage from "@/react-app/pages/PublicContact";
import PublicBookingPage from "@/react-app/pages/PublicBooking";
import PublicFormPage from "@/react-app/pages/PublicForm";
import PublicConversationPage from "@/react-app/pages/PublicConversation";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        <Route path="/view-message/:id" element={<PublicConversationPage />} />

        {/* App Routes */}
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/inbox" element={<AppLayout><InboxPage /></AppLayout>} />
        <Route path="/bookings" element={<AppLayout><BookingsPage /></AppLayout>} />
        <Route path="/forms" element={<AppLayout><FormsPage /></AppLayout>} />
        <Route path="/inventory" element={<AppLayout><InventoryPage /></AppLayout>} />
        <Route path="/team" element={<AppLayout><TeamPage /></AppLayout>} />
        <Route path="/automation" element={<AppLayout><AutomationPage /></AppLayout>} />
        <Route path="/services" element={<AppLayout><ServicesPage /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      <Chatbot />
    </Router>
  );
}
