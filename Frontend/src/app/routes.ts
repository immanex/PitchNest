import { createBrowserRouter } from "react-router-dom";
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
import PrePitch from "./pages/PrePitch";
import MyPitches from "./pages/MyPitches";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import AppLayout from "./layout/AppLayout";

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
    path: "/email-verification",
    Component: EmailVerification,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/modes",
    Component: ModeSelection,
  },

  /* DASHBOARD AREA */
  {
    path: "/",
    Component: AppLayout,
    children: [
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "pre-pitch",
        Component: PrePitch,
      },
      {
        path: "analytics",
        Component: Analytics,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "my-pitches",
        Component: MyPitches,
      },
      {
        path: "pitch-detail",
        Component: PostPitchAnalytics,
      },
    ],
  },

  {
    path: "/room/:roomId",
    Component: LivePitchRoom,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
