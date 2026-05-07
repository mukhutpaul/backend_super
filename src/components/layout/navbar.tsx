"use client";

import { Menu } from "lucide-react";

const themes = [
  "light",
  "dark",
  "cupcake",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "dracula",
  "night",
  "coffee",
  "luxury",
];

export default function Navbar({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const changeTheme = (theme: string) => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-3 flex-1">

        <button
          className="btn btn-ghost btn-circle"
          onClick={toggleSidebar}
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-primary">
            PNC Controle Manager
          </h1>

          <p className="text-xs opacity-70">
            Gestion des effectifs policiers
          </p>
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* THEME SELECT */}
        <select
          className="select select-bordered select-sm w-44"
          defaultValue={
            typeof window !== "undefined"
              ? localStorage.getItem("theme") || "light"
              : "light"
          }
          onChange={(e) =>
            changeTheme(e.target.value)
          }
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>

        {/* USER DROPDOWN */}
        <div className="dropdown dropdown-end">

          {/* Avatar */}
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
              A
            </div>
          </div>

          {/* Menu */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >

            <li>
              <a>👤 Mon profil</a>
            </li>

            <li>
              <a>⚙️ Paramètres</a>
            </li>

            <li>
              <a>🔔 Notifications</a>
            </li>

            <div className="divider my-1"></div>

            <li>
              <button
                onClick={logout}
                className="text-error"
              >
                🚪 Déconnexion
              </button>
            </li>

          </ul>
        </div>

      </div>
    </div>
  );
}