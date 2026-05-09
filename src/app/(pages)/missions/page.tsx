"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Select from "react-select";

import {
    getMissions,
    createMission,
    updateMission,
    deleteMission,
    startMission,
    closeMission,
    Mission
} from "@/services/mission.service";

import { Pencil, Trash2, Play, Square, X, Inbox, Search } from "lucide-react";
import { getUsers } from "@/services/auth.service";

type FormData = {
    zone: string;
    numero: string;
    chargeMissionId: number;
};

export default function MissionsPage() {

    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
    });
    const [superviseurs, setSuperviseurs] = useState<any[]>([]);

    const [form, setForm] = useState<FormData>({
        zone: "",
        numero: "",
        chargeMissionId: 0,
    });

    const [page, setPage] = useState(1);
    const limit = 20;

    const filteredMissions = missions.filter((m) => {

        const matchSearch =
            filters.search === "" ||
            m.zone.toLowerCase().includes(filters.search.toLowerCase()) ||
            m.numero.toLowerCase().includes(filters.search.toLowerCase());

        const matchStatus =
            filters.status === "" ||
            (filters.status === "ACTIVE" && m.isActive) ||
            (filters.status === "INACTIVE" && !m.isActive);

        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredMissions.length / limit);

    const paginatedMissions = filteredMissions.slice(
        (page - 1) * limit,
        page * limit
    );
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const fetchMissions = async () => {
        try {
            setLoading(true);

            const data = await getMissions();

            setMissions(data);

        } catch (error) {

            console.error("Erreur fetch missions:", error);
            toast.error("Erreur chargement missions");

        } finally {

            setLoading(false);
        }
    };

    const generateMissionNumber = (zone: string) => {
        if (!zone) return "";

        const prefix = zone
            .trim()
            .toUpperCase()
            .substring(0, 2);

        const unique = Date.now().toString().slice(-5);

        return `${prefix}-${unique}`;
    };

    const fetchSuperviseurs = async () => {
        try {
            const data = await getUsers();

            const filtered = data.filter(
                (u: any) => u.profile?.name === "SUPERVISEUR"
            );

            setSuperviseurs(filtered);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMissions();
        fetchSuperviseurs();
    }, []);

    /**
     * CREATE
     */
    const handleCreate = async () => {
        try {
            await createMission(form);
            toast.success("Mission créée");
            setOpenModal(false);
            fetchMissions();
        } catch {
            toast.error("Erreur création");
        }
    };

    /**
     * START MISSION
     */
    const handleStart = async (id: number) => {
        try {
            await startMission(id);
            toast.success("Mission activée");
            fetchMissions();
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Erreur activation"
            );
        }
    };

    /**
     * CLOSE MISSION
     */
    const handleClose = async (id: number) => {
        try {
            await closeMission(id);
            toast.success("Mission clôturée");
            fetchMissions();
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Erreur activation"
            );
        }
    };

    /**
     * DELETE
     */
    const handleDelete = async (id: number) => {
        const res = await Swal.fire({
            title: "Supprimer mission ?",
            icon: "warning",
            showCancelButton: true,
        });

        if (res.isConfirmed) {
            await deleteMission(id);
            toast.success("Supprimée");
            fetchMissions();
        }
    };

    return (
        <DashboardLayout>

            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Missions</h1>
                        <p className="text-sm opacity-70">
                            Gestion nationale des missions
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setOpenModal(true)}
                    >
                        + Nouvelle mission
                    </button>
                </div>

                {/* 🔎 FILTERS */}
                <div className="card bg-base-200 shadow-sm">

                    <div className="card-body">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {/* SEARCH GLOBAL */}
                            <label className="input input-bordered flex items-center gap-2">

                                <Search size={16} />

                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Rechercher mission (zone, numéro...)"
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search: e.target.value,
                                        })
                                    }
                                />

                            </label>

                            {/* FILTRE STATUS */}
                            <select
                                className="select select-bordered w-full"
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="">Tous statuts</option>
                                <option value="ACTIVE">Actives</option>
                                <option value="INACTIVE">En attente</option>
                            </select>

                        </div>

                    </div>

                </div>

                {/* TABLE */}
                *{/* TABLE + PAGINATION */}
                <div className="card bg-base-100 shadow-md">

                    <div className="card-body p-0">

                        <div className="overflow-x-auto">

                            <table className="table w-full">

                                <thead className="bg-base-200">
                                    <tr>
                                        <th>ID</th>
                                        <th>Zone</th>
                                        <th>Numéro</th>
                                        <th>Statut</th>
                                        <th>Debut</th>
                                        <th>Fin</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {loading && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10">
                                                <span className="loading loading-spinner loading-md"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && filteredMissions.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-2 opacity-70">
                                                    <Inbox className="w-8 h-8" />
                                                    <p className="font-semibold">Aucune mission trouvée</p>
                                                    <p className="text-sm">Créez une nouvelle mission pour commencer</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && paginatedMissions.map((m) => (
                                        <tr key={m.id} className="hover">
                                            <td>{m.id}</td>
                                            <td>{m.zone}</td>
                                            <td>{m.numero}</td>

                                            <td>
                                                {m.isActive ? (
                                                    <span className="badge badge-success">Active</span>
                                                ) : (
                                                    <span className="badge badge-warning">En attente</span>
                                                )}
                                            </td>

                                            <td>{m.dateDebut || "-"}</td>
                                            <td>{m.dateFin || "-"}</td>

                                            <td className="flex gap-2">
                                                {!m.isActive && (
                                                    <button
                                                        className="btn btn-xs btn-success"
                                                        onClick={() => handleStart(m.id)}
                                                    >
                                                        Activer
                                                    </button>
                                                )}

                                                {m.isActive && (
                                                    <button
                                                        className="btn btn-xs btn-warning"
                                                        onClick={() => handleClose(m.id)}
                                                    >
                                                        Clôturer
                                                    </button>
                                                )}

                                                <button
                                                    className="btn btn-xs btn-error"
                                                    onClick={() => handleDelete(m.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>

                        {/* ✅ PAGINATION ALIGNÉE */}
                        <div className="flex justify-between items-center px-4 py-3 border-t border-base-300">

                            <p className="text-sm opacity-70">
                                Page {page} / {totalPages || 1} — Total : {filteredMissions.length}
                            </p>

                            <div className="join">

                                <button
                                    className="join-item btn btn-sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    « Précédent
                                </button>

                                <button
                                    className="join-item btn btn-sm"
                                    disabled={page === totalPages || totalPages === 0}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Suivant »
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            </div>

            {/* CREATE MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-base-100 p-6 rounded-xl w-full max-w-md">

                        <h2 className="text-xl font-bold mb-4">
                            Nouvelle mission
                        </h2>

                        <input
                            className="input input-bordered w-full mb-2"
                            placeholder="Zone"
                            value={form.zone}
                            onChange={(e) => {
                                const zone = e.target.value;

                                setForm((prev) => ({
                                    ...prev,
                                    zone,
                                    numero: generateMissionNumber(zone), // auto update
                                }));
                            }}
                        />

                        <input
                            className="input input-bordered w-full mb-2"
                            placeholder="Numéro mission"
                            value={form.numero}
                            readOnly
                        />


                        <div className="mb-4">

                            <label className="label">
                                <span className="label-text">
                                    Chef mission (SUPERVISEUR)
                                </span>
                            </label>

                            <Select
                                unstyled
                                isSearchable
                                placeholder="Rechercher superviseur..."

                                options={superviseurs.map((u: any) => ({
                                    value: u.id,
                                    label: u.noms || u.username,
                                }))}

                                value={
                                    superviseurs
                                        .map((u: any) => ({
                                            value: u.id,
                                            label: u.noms || u.username,
                                        }))
                                        .find(
                                            (opt: any) =>
                                                opt.value === form.chargeMissionId
                                        ) || null
                                }

                                onChange={(selected: any) =>
                                    setForm({
                                        ...form,
                                        chargeMissionId: selected?.value || 0,
                                    })
                                }

                                classNames={{
                                    control: () =>
                                        "input input-bordered w-full min-h-[48px] flex flex-wrap px-2",

                                    valueContainer: () =>
                                        "flex gap-1 items-center",

                                    input: () =>
                                        "text-sm text-base-content",

                                    placeholder: () =>
                                        "text-base-content/50 text-sm",

                                    menu: () =>
                                        "bg-base-100 border border-base-300 rounded-box shadow-lg mt-2 z-50 overflow-hidden",

                                    option: ({ isFocused, isSelected }) =>
                                        `
                                    px-4 py-2 cursor-pointer text-sm
                                    ${isFocused ? "bg-base-200" : ""}
                                    ${isSelected ? "bg-primary text-primary-content" : ""}
                                `,

                                    singleValue: () =>
                                        "text-sm text-base-content",

                                    dropdownIndicator: () =>
                                        "px-2 text-base-content/70",

                                    indicatorSeparator: () =>
                                        "hidden",

                                    menuList: () =>
                                        "max-h-60 overflow-y-auto",
                                }}
                            />

                        </div>

                        <div className="flex justify-end gap-2">

                            <button
                                className="btn"
                                onClick={() => setOpenModal(false)}
                            >
                                Annuler
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                            >
                                Créer
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </DashboardLayout>
    );
}