import { createBrowserRouter } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import ModeSelection from "./pages/ModeSelection";
import LivePitchRoom from "./pages/LivePitchRoom";
import PostPitchAnalytics from "./pages/PostPitchAnalytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/dashboard",
    Component: ModeSelection,
  },
  {
    path: "/pitch",
    Component: LivePitchRoom,
  },
  {
    path: "/analytics",
    Component: PostPitchAnalytics,
  },
]);