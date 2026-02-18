import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TournamentDetails from "./pages/TournamentDetails";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AvatarMaker from "./pages/AvatarMaker";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentHistory from "./pages/PaymentHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import Contact from "./pages/Contact";
import Leaderboard from "./pages/Leaderboard";
import DownloadLogo from "./pages/DownloadLogo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/avatar-maker" element={<AvatarMaker />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/download-logo" element={<DownloadLogo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;