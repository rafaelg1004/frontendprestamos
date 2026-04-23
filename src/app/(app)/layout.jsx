"use client";

import { useState } from "react";
import "../globals.css";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className="main-content"
        style={{
          marginLeft: sidebarCollapsed ? "4rem" : "16rem",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
