import {
  Users,
  UserCheck,
  UserX,
  ClipboardCheck,
} from "lucide-react";

export default function DashboardCards() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tableau de bord
        </h1>

        <p className="text-sm text-base-content/60 mt-1">
          Système de contrôle des effectifs policiers
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* TOTAL */}
        <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition">
          <div className="card-body p-4">

            <div className="flex items-center justify-between">
              <p className="text-sm text-base-content/60">
                Total policiers
              </p>
              <Users className="w-5 h-5 text-primary" />
            </div>

            <p className="text-2xl font-bold mt-2">
              2,540
            </p>

          </div>
        </div>

        {/* PRESENTS */}
        <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition">
          <div className="card-body p-4">

            <div className="flex items-center justify-between">
              <p className="text-sm text-base-content/60">
                Présents
              </p>
              <UserCheck className="w-5 h-5 text-success" />
            </div>

            <p className="text-2xl font-bold mt-2">
              2,100
            </p>

          </div>
        </div>

        {/* ABSENTS */}
        <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition">
          <div className="card-body p-4">

            <div className="flex items-center justify-between">
              <p className="text-sm text-base-content/60">
                Absents
              </p>
              <UserX className="w-5 h-5 text-error" />
            </div>

            <p className="text-2xl font-bold mt-2">
              440
            </p>

          </div>
        </div>

        {/* CONTROLES */}
        <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition">
          <div className="card-body p-4">

            <div className="flex items-center justify-between">
              <p className="text-sm text-base-content/60">
                Contrôles
              </p>
              <ClipboardCheck className="w-5 h-5 text-secondary" />
            </div>

            <p className="text-2xl font-bold mt-2">
              310
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}