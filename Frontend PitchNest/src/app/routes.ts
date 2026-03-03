import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
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
