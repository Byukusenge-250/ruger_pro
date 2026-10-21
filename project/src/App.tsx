import { Routes, Route } from "react-router-dom";
import { Header, Footer } from "./components/Chrome";
import { Assistant } from "./components/Assistant";
import LandingPage from "./pages/Landing";
import ExplorePage from "./pages/Explore";
import PhotographerProfilePage from "./pages/PhotographerProfile";
import AboutPage from "./pages/About";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/Admin";
import NotFoundPage from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/photographers/:id" element={<PhotographerProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Assistant />
    </div>
  );
}
