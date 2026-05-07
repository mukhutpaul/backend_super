import Link from "next/link";
import {
  LayoutDashboard,
  Shield,
  Users,
  ClipboardCheck,
  FileBarChart,
  Settings,
} from "lucide-react";

export default function Sidebar({
  isOpen,
}: {
  isOpen: boolean;
}) {
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
          <h2 className="text-2xl font-bold text-primary whitespace-nowrap">
            CMP
          </h2>

          {isOpen && (
            <p className="text-sm opacity-70 mt-1 whitespace-nowrap">
              Controle des effectifs
            </p>
          )}
        </div>

    <ul className="menu p-3 gap-2 w-full">

          <li>
            <Link href="/dashboard">
              <LayoutDashboard size={20} />
              {isOpen && <span>Dashboard</span>}
            </Link>
          </li>

          <li>
            <Link href="/dashboard/policiers">
              <Users size={20} />
              {isOpen && <span>Policiers</span>}
            </Link>
          </li>

           <li>
            <Link href="/dashboard/controles">
              <ClipboardCheck size={20} />
              {isOpen && <span>Contrôles</span>}
            </Link>
          </li>

          <li>
            <Link href="/dashboard/rapports">
              <FileBarChart size={20} />
              {isOpen && <span>Rapports</span>}
            </Link>
          </li>

          <li>
            <Link href="/dashboard/utilisateurs">
              <Shield size={20} />
              {isOpen && <span>Utilisateurs</span>}
            </Link>
          </li>

          <li>
            <Link href="/dashboard/settings">
              <Settings size={20} />
              {isOpen && <span>Paramètres</span>}
            </Link>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-base-300 text-center text-sm opacity-70 whitespace-nowrap">
        ABA@2026
      </div>
    </aside>
  );
}