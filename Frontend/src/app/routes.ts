import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import ProfileSetup from "./pages/ProfileSetup";
import ModeSelection from "./pages/ModeSelection";
import LivePitchRoom from "./pages/LivePitchRoom";
import PostPitchAnalytics from "./pages/PostPitchAnalytics";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/verify-email",
    Component: EmailVerification,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/dashboard",

    Component: Dashboard,
  },
  {
    path: "/modes",
    Component: ModeSelection,
  },
  {
    path: "/room/:roomId",
    Component: LivePitchRoom,
  },
  {
    path: "/analytics",
    Component: PostPitchAnalytics,
  },
  {
    path: "/settings",
    Component: Settings,
  },
]);