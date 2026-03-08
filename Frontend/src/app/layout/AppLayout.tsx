import Sidebar from "../pages/Sidebar";
import Header from "../pages/Header";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#0D1117]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-2 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}