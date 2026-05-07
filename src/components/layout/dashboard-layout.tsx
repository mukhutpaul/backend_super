"use client";

import { useState } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [isOpen, setIsOpen] =
    useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex bg-base-100 min-h-screen overflow-hidden">

      <Sidebar isOpen={isOpen} />

      <div className="flex-1 flex flex-col">

        <Navbar
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 p-6 overflow-y-auto bg-base-100">
          {children}
        </main>
      </div>
    </div>
  );
}