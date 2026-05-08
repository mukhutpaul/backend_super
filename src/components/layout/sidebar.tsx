import Link from "next/link";
import {
  LayoutDashboard,
  Shield,
  Users,
  ClipboardCheck,
  FileBarChart,
  Settings,
  GlobeLock,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Role = "ADMIN" | "CONTROLEUR" | "MANAGER" | "SUPERVISEUR"

import { LucideIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  auth?: boolean;
  roles?: Role[];
}

export default function Sidebar({
  isOpen,
}: {
  isOpen: boolean;
}) {
  const pathname = usePathname()
  const [pageName, setPageName] = useState<string | null>(null)

  const navLinks: NavLink[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMIN", "SUPERVISEUR"] },
    { href: "/policiers", icon: Users, label: "Policiers", auth: true, roles: ["ADMIN", "SUPERVISEUR"] },
    { href: "/controle", icon: ClipboardCheck, label: "Contrôles", auth: true, roles: ["ADMIN"] },
    { href: "/users", icon: Shield, label: "Utilisateurs", auth: true, roles: ["SUPERVISEUR","ADMIN"] }

  ]

  // Filtrer les liens selon l'auth et les rôles
  const filteredLinks = navLinks.filter((link) => {
    if (!link.auth) return true
    if (!localStorage.getItem("user")) return false
    if (link.roles) {
      // Convertir session.user.role string en Role
      const userRole = localStorage.getItem("profile") as Role
      return link.roles.includes(userRole)
    }
    return true
  })

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const renderLinks = () => (
    <>
      {filteredLinks.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className={`
            flex items-center gap-3
            px-3 py-2 rounded-lg
            transition
            ${isActiveLink(href)
                ? "bg-primary text-white"
                : "hover:bg-base-300"
              }
            ${!isOpen ? "justify-center" : ""}
          `}
          >
            <Icon size={20} />

            {isOpen && (
              <span className="whitespace-nowrap">
                {label}
              </span>
            )}
          </Link>
        </li>
      ))}

      {pageName && (
        <li>
          <Link
            href={`/page/${pageName}`}
            className={`
            flex items-center gap-3 px-3 py-2 rounded-lg
            hover:bg-base-300 transition
            ${!isOpen ? "justify-center" : ""}
          `}
          >
            <GlobeLock size={20} />
            {isOpen && <span>Page</span>}
          </Link>
        </li>
      )}
    </>
  );

  return (
    <aside
      className={`
        bg-base-200
        min-h-screen
        shadow-xl
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        overflow-hidden
        ${isOpen ? "w-72" : "w-0 lg:w-20"}
      `}
    >
      <div>

        <div className="p-5 border-b border-base-300">


          {isOpen && (
            <h2 className="text-2xl font-bold text-primary whitespace-nowrap">
              ABA-CM-PNC
            </h2>
          )}

           {!isOpen && (
            <h2 className="text-2xl font-bold text-primary whitespace-nowrap">
              CMP
            </h2>
          )}


          {isOpen && (
            <p className="text-sm opacity-70 mt-1 whitespace-nowrap">
              Controle des effectifs
            </p>
          )}
        </div>



        <ul className="menu p-3 gap-2 w-full">
          {renderLinks()}
        </ul>

      </div>

      {isOpen && (
        <div className="p-4 border-t border-base-300 text-center text-sm opacity-70 whitespace-nowrap">
          ABA@2026
        </div>
      )}
    </aside>
  );
}