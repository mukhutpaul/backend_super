"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X, Pencil, Trash2 } from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
    getUnites,
    createUnite,
    updateUnite,
    deleteUnite,
} from "@/services/unite.service";



/* ========================= TYPES ========================= */

type Person = {
    uuid: string;
    name: string;
};

type Unite = {
    id: number;
    name: string;
    signature?: string;
    commandant?: Person;
};

/* ========================= VALIDATION ========================= */

const schema = z.object({
    name: z.string().min(2),
    signature: z.string().optional(),
    commandantId: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

/* ========================= COMPONENT ========================= */

export default function UnitePage() {

    const [unites, setUnites] = useState<Unite[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [page, setPage] = useState(1);
    const limit = 20;

    /* ========================= FORM ========================= */

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    /* ========================= LOAD DATA ========================= */

    const fetchData = async () => {
        setLoading(true);

        try {
            const data = await getUnites();

            setUnites(
                data.map((u: any) => ({
                    ...u,
                    signature: u.signature ?? undefined, // ✅ FIX IMPORTANT
                }))
            );

        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchData();
    }, []);

    /* ========================= FILTER ========================= */

    const filtered = unites.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / limit);

    const paginated = filtered.slice(
        (page - 1) * limit,
        page * limit
    );

    /* ========================= CREATE ========================= */

    // const onCreate = async (data: FormData) => {
    //     try {
    //         await createUnite({
    //             name: data.name,
    //             signature: data.signature,
    //             commandant: data.commandantId
    //                 ? { uuid: data.commandantId }
    //                 : null,
    //         });

    //         toast.success("Unité créée");
    //         setOpenModal(false);
    //         reset();
    //         fetchData();

    //     } catch {
    //         toast.error("Erreur création");
    //     }
    // };

    /* ========================= EDIT ========================= */

    const openEdit = (u: Unite) => {
        setEditingId(u.id);
        setEditModal(true);

        resetEdit({
            name: u.name,
            signature: u.signature || "",
            commandantId: u.commandant?.uuid || "",
        });
    };

    // const onUpdate = async (data: FormData) => {
    //     if (!editingId) return;

    //     try {
    //         await updateUnite(editingId, {
    //             name: data.name,
    //             signature: data.signature,
    //             commandant: data.commandantId
    //                 ? { uuid: data.commandantId }
    //                 : null,
    //         });

    //         toast.success("Modifié");
    //         setEditModal(false);
    //         setEditingId(null);
    //         fetchData();

    //     } catch {
    //         toast.error("Erreur modification");
    //     }
    // };

    /* ========================= DELETE ========================= */

    const onDelete = async (id: number) => {
        const res = await Swal.fire({
            title: "Supprimer ?",
            icon: "warning",
            showCancelButton: true,
        });

        if (res.isConfirmed) {
            await deleteUnite(id);
            toast.success("Supprimé");
            fetchData();
        }
    };

    /* ========================= UI ========================= */

    return (
        <DashboardLayout>

            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Unités
                        </h1>
                        <p className="text-sm opacity-70">
                            Gestion des unités
                        </p>
                    </div>

                    {/* <button
                        className="btn btn-primary"
                        onClick={() => setOpenModal(true)}
                    >
                        + Ajouter unité
                    </button> */}

                </div>

                {/* SEARCH */}
                <div className="card bg-base-200">

                    <div className="card-body">

                        <input
                            className="input input-bordered w-full"
                            placeholder="Recherche..."
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />

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
                                        <th>Nom</th>
                                        <th>Commandant</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {loading && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10">
                                                <span className="loading loading-spinner"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10">
                                                <Search className="mx-auto opacity-50" />
                                                <p>Aucune unité</p>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && paginated.map((u) => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.name}</td>
                                            <td>{u.commandant?.name || "-"}</td>

                                            <td className="flex gap-2">

                                                <button
                                                    className="btn btn-xs"
                                                    onClick={() => openEdit(u)}
                                                >
                                                    <Pencil size={14} />
                                                </button>

                                                <button
                                                    className="btn btn-xs text-error"
                                                    onClick={() => onDelete(u.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

                {/* PAGINATION */}
                {/* 📄 PAGINATION SIMPLE (PREV / NEXT ONLY) */}
                <div className="flex justify-between items-center">

                    <p className="text-sm opacity-70">
                        Page {page} / {totalPages || 1} — Total : {filtered.length} utilisateur(s)
                    </p>

                    <div className="join">

                        {/* PREVIOUS */}
                        <button
                            className="join-item btn btn-sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            « Précédent
                        </button>

                        {/* NEXT */}
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

            {/* CREATE MODAL */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-base-100 p-5 rounded-xl w-96">

                        <h2 className="text-lg font-bold mb-3">
                            Ajouter unité
                        </h2>

                        <form className="space-y-2">

                            <input
                                className="input w-full"
                                placeholder="Nom"
                                {...register("name")}
                            />

                            <select
                                className="select w-full"
                                {...register("commandantId")}
                            >
                                <option value="">Commandant</option>
                                {persons.map(p => (
                                    <option key={p.uuid} value={p.uuid}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            <button className="btn btn-primary w-full">
                                Créer
                            </button>

                        </form>

                    </div>

                </div>
            )}

            {/* EDIT MODAL */}
            {editModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

                    <div className="bg-base-100 p-5 rounded-xl w-96">

                        <h2 className="text-lg font-bold mb-3">
                            Modifier unité
                        </h2>

                        <form className="space-y-2">

                            <input
                                className="input w-full"
                                {...registerEdit("name")}
                            />

                            <select
                                className="select w-full"
                                {...registerEdit("commandantId")}
                            >
                                <option value="">Commandant</option>
                                {persons.map(p => (
                                    <option key={p.uuid} value={p.uuid}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            <button className="btn btn-primary w-full">
                                Modifier
                            </button>

                        </form>

                    </div>

                </div>
            )}

        </DashboardLayout>
    );
}