import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Debates from "./pages/Debates";
import DebateRoom from "./pages/DebateRoom";
import Profile from "./pages/Profile";
import Topics from "./pages/Topics";
import Home from "./pages/Home";
import TextChat from "./pages/TextChat";
import Messages from "./pages/Messages";
import InviteUsers from "./pages/InviteUsers";
import InvitePreview from "./pages/InvitePreview";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import PublicProfile from "./pages/PublicProfile";
import Conversation from "./pages/Conversation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/debates" element={<Debates />} />
              <Route path="/debates/:id" element={<DebateRoom />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<PublicProfile />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/home" element={<Home />} />
              <Route path="/text/:id" element={<Conversation />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/invite" element={<InviteUsers />} />
              <Route path="/invite/:username" element={<InvitePreview />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
