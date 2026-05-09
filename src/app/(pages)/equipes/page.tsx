// app/dashboard/equipes/page.tsx

"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Select from "react-select";

import equipeService, { Equipe } from "@/services/equipe.service";
import { getUsers } from "@/services/auth.service";
import { getMissions } from "@/services/mission.service";

import {
    Trash2,
    Pencil,
    Inbox,
    Search,
    Users,
    X,
} from "lucide-react";

type FormData = {
    userId: number;
    missionId: number;
    isActive: boolean;
};

export default function EquipesPage() {
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [missions, setMissions] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);

    const [filters, setFilters] = useState({
        search: "",
        status: "",
    });

    const [form, setForm] = useState<FormData>({
        userId: 0,
        missionId: 0,
        isActive: true,
    });

    const [page, setPage] = useState(1);

    const limit = 10;

    /**
     * FETCH EQUIPES
     */
    const fetchEquipes = async () => {
        try {
            setLoading(true);

            const data = await equipeService.getAll();

            setEquipes(data);
        } catch (error) {
            console.error(error);
            toast.error("Erreur chargement équipes");
        } finally {
            setLoading(false);
        }
    };

    /**
     * FETCH USERS
     */
    const fetchUsers = async () => {
        try {
            const data = await getUsers();

            const superviseurs = data.filter(
                (u: any) => u.profile?.name === "SUPERVISEUR"
            );

            setUsers(superviseurs);

        } catch (error) {
            console.error(error);
        }
    };

    /**
     * FETCH MISSIONS
     */
    const fetchMissions = async () => {
        try {
            const data = await getMissions();
            setMissions(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchEquipes();
        fetchUsers();
        fetchMissions();
    }, []);

    /**
     * FILTERS
     */
    const filteredEquipes = equipes.filter((e: any) => {
        const search = filters.search.toLowerCase();

        const matchSearch =
            filters.search === "" ||
            e.user?.noms?.toLowerCase().includes(search) ||
            e.user?.username?.toLowerCase().includes(search) ||
            e.mission?.numero?.toLowerCase().includes(search) ||
            e.mission?.zone?.toLowerCase().includes(search);

        const matchStatus =
            filters.status === "" ||
            (filters.status === "ACTIVE" && e.isActive) ||
            (filters.status === "INACTIVE" && !e.isActive);

        return matchSearch && matchStatus;
    });

    /**
     * PAGINATION
     */
    const totalPages = Math.ceil(filteredEquipes.length / limit);

    const paginatedEquipes = filteredEquipes.slice(
        (page - 1) * limit,
        page * limit
    );

    useEffect(() => {
        setPage(1);
    }, [filters]);

    /**
     * CREATE
     */
    // ✅ CREATE
    const handleCreate = async () => {
        try {
            await equipeService.create({
                user: {
                    id: form.userId,
                },
                mission: {
                    id: form.missionId,
                },
                isActive: true, // force actif
            });

            toast.success("Équipe créée");

            setOpenModal(false);

            fetchEquipes();

            resetForm();

        } catch (error) {
            console.error(error);
            toast.error("Erreur création");
        }
    };

    /**
     * EDIT OPEN
     */
    const handleEditOpen = (equipe: any) => {
        setEditingId(equipe.id);

        setForm({
            userId: equipe.user?.id,
            missionId: equipe.mission?.id,
            isActive: equipe.isActive,
        });

        setEditModal(true);
    };

    /**
     * UPDATE
     */
    // ✅ UPDATE
    const handleUpdate = async () => {
        if (!editingId) return;

        try {
            await equipeService.update(editingId, {
                user: {
                    id: form.userId,
                },
                mission: {
                    id: form.missionId,
                },
                isActive: true, // toujours actif
            });

            toast.success("Équipe modifiée");

            setEditModal(false);

            fetchEquipes();

            resetForm();

        } catch (error) {
            console.error(error);
            toast.error("Erreur modification");
        }
    };

    /**
     * DELETE
     */
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Supprimer cette équipe ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui",
        });

        if (result.isConfirmed) {
            try {
                await equipeService.delete(id);

                toast.success("Équipe supprimée");

                fetchEquipes();
            } catch (error) {
                console.error(error);
                toast.error("Erreur suppression");
            }
        }
    };

    /**
     * RESET FORM
     */
    const resetForm = () => {
        setForm({
            userId: 0,
            missionId: 0,
            isActive: true,
        });

        setEditingId(null);
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Équipes</h1>

                        <p className="text-sm opacity-70">
                            Gestion des équipes opérationnelles
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => setOpenModal(true)}
                    >
                        + Nouvelle équipe
                    </button>
                </div>

                {/* FILTERS */}
                <div className="card bg-base-200 shadow-sm">
                    <div className="card-body">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {/* SEARCH */}
                            <label className="input input-bordered flex items-center gap-2">

                                <Search size={16} />

                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Rechercher équipe..."
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            {/* STATUS */}
                            <select
                                className="select select-bordered"
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
                                <option value="INACTIVE">Inactives</option>
                            </select>

                        </div>

                    </div>
                </div>

                {/* TABLE */}
                <div className="card bg-base-100 shadow-md">

                    <div className="card-body p-0">

                        <div className="overflow-x-auto">

                            <table className="table">

                                <thead className="bg-base-200">
                                    <tr>
                                        <th>ID</th>
                                        <th>Equipe</th>
                                        <th>Mission</th>
                                        <th>Zone</th>
                                        <th>Statut</th>
                                        <th>Date création</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {loading && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10">
                                                <span className="loading loading-spinner"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && paginatedEquipes.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10">

                                                <div className="flex flex-col items-center gap-2 opacity-70">

                                                    <Inbox className="w-8 h-8" />

                                                    <p className="font-semibold">
                                                        Aucune équipe trouvée
                                                    </p>

                                                </div>

                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        paginatedEquipes.map((e: any) => (
                                            <tr key={e.id} className="hover">

                                                <td>{e.id}</td>

                                                <td>
                                                    Equipe-{e.user?.username}
                                                </td>

                                                <td>{e.mission?.numero}</td>

                                                <td>{e.mission?.zone}</td>

                                                <td>
                                                    {e.isActive ? (
                                                        <span className="badge badge-success">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-error">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {e.createdAt
                                                        ? new Date(e.createdAt).toLocaleString()
                                                        : "-"}
                                                </td>

                                                <td className="flex gap-2">

                                                    <button
                                                        className="btn btn-xs btn-info"
                                                        onClick={() => handleEditOpen(e)}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>

                                                    <button
                                                        className="btn btn-xs btn-error"
                                                        onClick={() => handleDelete(e.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>

                                                </td>

                                            </tr>
                                        ))}

                                </tbody>

                            </table>

                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-between items-center px-4 py-3 border-t">

                            <p className="text-sm opacity-70">
                                Page {page} / {totalPages || 1}
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

                {/* CREATE MODAL */}
                {openModal && (
                    <EquipeModal
                        title="Nouvelle équipe"
                        form={form}
                        setForm={setForm}
                        users={users}
                        missions={missions}
                        onClose={() => {
                            setOpenModal(false);
                            resetForm();
                        }}
                        onSubmit={handleCreate}
                    />
                )}

                {/* EDIT MODAL */}
                {editModal && (
                    <EquipeModal
                        title="Modifier équipe"
                        form={form}
                        setForm={setForm}
                        users={users}
                        missions={missions}
                        onClose={() => {
                            setEditModal(false);
                            resetForm();
                        }}
                        onSubmit={handleUpdate}
                    />
                )}

            </div>
        </DashboardLayout>
    );
}

/**
 * MODAL
 */
function EquipeModal({
    title,
    form,
    setForm,
    users,
    missions,
    onClose,
    onSubmit,
}: any) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-base-100 p-6 rounded-xl w-full max-w-md">

                <div className="flex justify-between items-center mb-4">

                    <h2 className="text-xl font-bold">{title}</h2>

                    <button className="btn btn-sm btn-circle" onClick={onClose}>
                        <X size={16} />
                    </button>

                </div>

                {/* AGENT */}
                <div className="mb-4">

                    <label className="label">
                        <span className="label-text">Agent superviseur</span>
                    </label>

                    <Select
                        options={users.map((u: any) => ({
                            value: u.id,
                            label: u.noms || u.username,
                        }))}

                        value={
                            users
                                .map((u: any) => ({
                                    value: u.id,
                                    label: u.noms || u.username,
                                }))
                                .find((opt: any) => opt.value === form.userId) || null
                        }

                        onChange={(selected: any) =>
                            setForm({
                                ...form,
                                userId: selected?.value || 0,
                            })
                        }

                        placeholder="Rechercher un superviseur..."
                        isSearchable
                        className="text-black"
                    />

                </div>

                {/* MISSION */}
                <div className="mb-5">

                    <label className="label">
                        <span className="label-text">Mission</span>
                    </label>

                    <Select
                        options={missions.map((m: any) => ({
                            value: m.id,
                            label: `${m.numero}`,
                        }))}

                        value={
                            missions
                                .map((m: any) => ({
                                    value: m.id,
                                    label: `${m.numero}`,
                                }))
                                .find((opt: any) => opt.value === form.missionId) || null
                        }

                        onChange={(selected: any) =>
                            setForm({
                                ...form,
                                missionId: selected?.value || 0,
                            })
                        }

                        placeholder="Rechercher une mission..."
                        isSearchable
                        className="text-black"
                    />

                </div>

                <div className="flex justify-end gap-2">

                    <button className="btn" onClick={onClose}>
                        Annuler
                    </button>

                    <button className="btn btn-primary" onClick={onSubmit}>
                        Enregistrer
                    </button>

                </div>

            </div>

        </div>
    );
}