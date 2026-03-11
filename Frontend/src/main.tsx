import { createRoot } from "react-dom/client";
import "./styles/index.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes.ts";

import { UserProvider } from "./app/context/UserContext.tsx";
import { PeerProvider } from "./app/context/peer";
import { PitchProvider } from "./app/context/PitchContext.tsx";

createRoot(document.getElementById("root")!).render(
  <PeerProvider>
    <PitchProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </PitchProvider>
  </PeerProvider>,
);
