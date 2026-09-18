import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FloatingSupport from "@/components/FloatingSupport";
import CookieConsent from "@/components/CookieConsent";

// Découpage du bundle : chaque page est chargée uniquement quand on la visite.
const TournamentDetails = React.lazy(() => import("./pages/TournamentDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const EditProfile = React.lazy(() => import("./pages/EditProfile"));
const AvatarMaker = React.lazy(() => import("./pages/AvatarMaker"));
const Auth = React.lazy(() => import("./pages/Auth"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const PaymentHistory = React.lazy(() => import("./pages/PaymentHistory"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const LegalNotice = React.lazy(() => import("./pages/LegalNotice"));
const Games = React.lazy(() => import("./pages/Games"));
const GameDetails = React.lazy(() => import("./pages/GameDetails"));
const News = React.lazy(() => import("./pages/News"));
const NewsDetail = React.lazy(() => import("./pages/NewsDetail"));
const About = React.lazy(() => import("./pages/About"));
const BecomePartner = React.lazy(() => import("./pages/BecomePartner"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen bg-[#07070C] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/tournament/:id" element={<TournamentDetails />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/avatar-maker" element={<AvatarMaker />} />
              <Route path="/payments" element={<PaymentHistory />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/classement" element={<Leaderboard />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="/about" element={<About />} />
              <Route path="/devenir-partenaire" element={<BecomePartner />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/jeux" element={<Games />} />
              <Route path="/game/:id" element={<GameDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingSupport />
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
