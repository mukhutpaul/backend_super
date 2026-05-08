"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfiles } from "@/services/profile.service";

import { getUsers } from "@/services/auth.service";

type Profile = {
    id: number;
    name: string;
};

type User = {
    id: number;
    username: string;
    email: string;
    noms: string;
    profile?: Profile;
};

export default function UsersPage() {

    const [users, setUsers] = useState<User[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: "",
        profile: "",
    });

    const [filtered, setFiltered] = useState<User[]>([]);

    // 📄 pagination
    const [page, setPage] = useState(1);
    const limit = 20;

    /**
     * 🔌 LOAD USERS FROM API
     */
    useEffect(() => {

        const fetchUsers = async () => {

            try {

                setLoading(true);

                const data = await getUsers();

                setUsers(data);
                setFiltered(data);

            } catch (error) {

                console.error("Erreur chargement users :", error);

            } finally {

                setLoading(false);
            }
        };

        fetchUsers();
        const fetchProfiles = async () => {

            try {

                const data = await getProfiles();

                setProfiles(data);

            } catch (error) {

                console.error(
                    "Erreur chargement profiles :",
                    error
                );
            }
        };

        fetchProfiles();


    }, []);

    /**
     * 🔎 FILTERS
     */
    useEffect(() => {

        let data = [...users];

        // 🔍 recherche
        if (filters.search) {

            const s = filters.search.toLowerCase();

            data = data.filter(
                (u) =>
                    u.username.toLowerCase().includes(s) ||
                    u.email.toLowerCase().includes(s) ||
                    u.noms.toLowerCase().includes(s)
            );
        }

        // 🎯 profile
        if (filters.profile) {
            data = data.filter(
                (u) => u.profile?.name === filters.profile
            );
        }

        setFiltered(data);
        setPage(1);

    }, [filters, users]);

    /**
     * 📄 PAGINATION
     */
    const totalPages = Math.ceil(filtered.length / limit);

    const paginatedData = filtered.slice(
        (page - 1) * limit,
        page * limit
    );

    return (
        <DashboardLayout>

            <div className="p-6 space-y-6">

                {/* 🧭 HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Utilisateurs
                        </h1>

                        <p className="text-sm opacity-70">
                            Gestion nationale des effectifs
                        </p>
                    </div>

                    <button className="btn btn-primary">
                        + Ajouter utilisateur
                    </button>

                </div>

                {/* 🔎 FILTERS */}
                <div className="card bg-base-200 shadow-sm">

                    <div className="card-body">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {/* SEARCH */}
                            <input
                                className="input input-bordered w-full"
                                placeholder="Recherche (username, email, noms...)"
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                            />

                            {/* PROFILE */}
                            <select
                                className="select select-bordered w-full"
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        profile: e.target.value,
                                    })
                                }
                            >

                                <option value="">
                                    Tous profils
                                </option>

                                {profiles.map((profile) => (

                                    <option
                                        key={profile.id}
                                        value={profile.name}
                                    >
                                        {profile.name}
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>

                </div>

                {/* 📊 TABLE */}
                <div className="card bg-base-100 shadow-md">

                    <div className="card-body p-0">

                        <div className="overflow-x-auto">

                            <table className="table">

                                <thead className="bg-base-200 text-base-content">

                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Noms</th>
                                        <th>Email</th>
                                        <th>Profil</th>
                                        <th className="text-center">
                                            Actions
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {/* ⏳ LOADING */}
                                    {loading && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-10"
                                            >
                                                <span className="loading loading-spinner loading-md"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {/* 📭 EMPTY */}
                                    {!loading && paginatedData.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-10 opacity-60"
                                            >
                                                Aucun utilisateur trouvé
                                            </td>
                                        </tr>
                                    )}

                                    {/* 📄 DATA */}
                                    {!loading &&
                                        paginatedData.map((u) => (

                                            <tr
                                                key={u.id}
                                                className="hover"
                                            >

                                                <td className="font-mono">
                                                    {u.id}
                                                </td>

                                                <td className="font-semibold">
                                                    {u.username}
                                                </td>

                                                <td>{u.noms}</td>

                                                <td>{u.email}</td>

                                                <td>

                                                    <span className="badge badge-info">
                                                        {u.profile?.name || "N/A"}
                                                    </span>

                                                </td>

                                                <td className="text-center">

                                                    <div className="flex justify-center items-center gap-2">

                                                        {/* 👁 */}
                                                        <button
                                                            className="btn btn-ghost btn-xs tooltip"
                                                            data-tip="Voir"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* ✏️ */}
                                                        <button
                                                            className="btn btn-ghost btn-xs tooltip"
                                                            data-tip="Modifier"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>

                                                        {/* 🗑 */}
                                                        <button
                                                            className="btn btn-ghost btn-xs text-error tooltip"
                                                            data-tip="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

                {/* 📄 PAGINATION */}
                <div className="flex justify-between items-center">

                    <p className="text-sm opacity-70">

                        Page {page} / {totalPages || 1}
                        {" — "}
                        {filtered.length} utilisateurs

                    </p>

                    <div className="join">

                        {/* PREV */}
                        <button
                            className="join-item btn btn-sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            «
                        </button>

                        {/* PAGES */}
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((p) => (

                            <button
                                key={p}
                                className={`join-item btn btn-sm ${page === p
                                    ? "btn-active"
                                    : ""
                                    }`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>

                        ))}

                        {/* NEXT */}
                        <button
                            className="join-item btn btn-sm"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            »
                        </button>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}