import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import PaintbrushCursor from "./components/PaintbrushCursor";
import AnnouncementBanner from "./components/AnnouncementBanner";
import PaintSplatter from "./components/PaintSplatter";

// Pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Upload from "./pages/Upload";
import ArtistProfile from "./pages/ArtistProfile";
import Portfolio from "./pages/Portfolio";
import Admin from "./pages/Admin";

function ProtectedRoute({ children, requireArtist = false }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><PaintSplatter /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (requireArtist && profile?.type !== "artist") return <Navigate to="/feed" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <PaintSplatter />
        <p className="text-cream/50 font-body text-sm">Loading Artspace…</p>
      </div>
    );
  }

  return (
    <>
      <PaintbrushCursor />
      <AnnouncementBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={
          <ProtectedRoute requireArtist><Onboarding /></ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute><Feed /></ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute requireArtist><Upload /></ProtectedRoute>
        } />
        <Route path="/artist/:username" element={<ArtistProfile />} />
        <Route path="/portfolio/:username" element={<Portfolio />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
