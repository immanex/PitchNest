import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { UserProvider } from "./app/context/UserContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { PeerProvider } from "./app/context/peer";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <PeerProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </PeerProvider>
  </BrowserRouter>,
);
