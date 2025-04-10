import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
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
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from '@/pages/AdminDashboard';

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
              <Route path="/register" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile/:username" element={<PublicProfile />} />
              <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/debates" element={<ProtectedRoute><Debates /></ProtectedRoute>} />
              <Route path="/debates/:id" element={<ProtectedRoute><DebateRoom /></ProtectedRoute>} />
              <Route path="/text/:id" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/invite" element={<InviteUsers />} />
              <Route path="/invite/:username" element={<InvitePreview />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
