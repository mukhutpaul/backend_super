"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import {
    Eye,
    Inbox,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Search } from "lucide-react";

import Swal from "sweetalert2";
import { updateUser, deleteUser } from "@/services/auth.service";

import {
    createUser,
    getUsers,
} from "@/services/auth.service";

import { getProfiles } from "@/services/profile.service";

import { toast } from "react-toastify";
import EmptyState from "@/components/EmptyState";

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

type UpdateUserPayload = {
    username?: string;
    email?: string;
    noms?: string;
    password?: string;
    profileId?: number;
};

const createUserSchema = z.object({
    username: z
        .string()
        .min(3, "Minimum 3 caractères"),

    noms: z
        .string()
        .min(3, "Nom invalide"),

    email: z
        .email("Email invalide"),

    password: z
        .string()
        .min(6, "Minimum 6 caractères"),

    profileId: z
        .string()
        .min(1, "Sélectionnez un profil"),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

/**
 * UPDATE
 */
const updateUserSchema = z.object({
    username: z.string().min(3),
    noms: z.string().min(3),
    email: z.string().email(),
    profileId: z.string().optional().or(z.literal("")),
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

export default function UsersPage() {

    const [users, setUsers] = useState<User[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const [loading, setLoading] = useState(true);
    const [profileSearch, setProfileSearch] = useState("");
    const [editModal, setEditModal] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);

    /**
     * 🔥 MODAL
     */
    const [openModal, setOpenModal] = useState(false);

    /**
       * CREATE FORM
       */
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
    });


    /**
     * UPDATE FORM (IMPORTANT FIX)
     */
    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        setValue: setValueEdit,
        reset: resetEdit,
        formState: { errors: errorsEdit },
    } = useForm<UpdateUserForm>({
        resolver: zodResolver(updateUserSchema),
    });



    const openEditModal = (user: User) => {
        setEditingUserId(user.id);
        setEditModal(true);

        resetEdit({
            username: user.username,
            noms: user.noms,
            email: user.email,
            profileId: user.profile?.id ? String(user.profile.id) : "",
        });
    };

    const handleUpdateUser = async (data: UpdateUserForm) => {
        if (editingUserId === null) return;

        try {
            await updateUser(editingUserId, {
                username: data.username,
                email: data.email,
                noms: data.noms,
                profileId: Number(data.profileId), // ✅ CORRECT
            });
            toast.success("Utilisateur modifié");

            setEditModal(false);
            setEditingUserId(null);

            resetEdit();

            fetchUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Erreur modification");
        }
    };



    /**
     * ➕ FORM
     */
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        noms: "",
        profileId: "",
    });

    const [filters, setFilters] = useState({
        search: "",
        profile: "",
    });

    const [filtered, setFiltered] = useState<User[]>([]);

    const filteredProfiles =
        profiles.filter((p) =>
            p.name
                .toLowerCase()
                .includes(
                    profileSearch.toLowerCase()
                )
        );

    /**
     * 📄 PAGINATION
     */
    const [page, setPage] = useState(1);

    const limit = 20;

    const openCreateModal = () => {
        setEditingUserId(null);
        setEditModal(false);

        reset({
            username: "",
            noms: "",
            email: "",
            password: "",
            profileId: "",
        });

        setOpenModal(true);
    };

    /**
     * 🔌 LOAD DATA
     */
    const fetchUsers = async () => {

        try {

            setLoading(true);

            const data = await getUsers();

            setUsers(data);
            setFiltered(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: number) => {
        const result = await Swal.fire({
            title: "Supprimer cet utilisateur ?",
            text: "Cette action est irréversible !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Oui supprimer",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);

                toast.success("Utilisateur supprimé");

                fetchUsers();
            } catch (error) {
                toast.error("Erreur suppression");
            }
        }
    };

    const fetchProfiles = async () => {

        try {

            const data = await getProfiles();

            setProfiles(data);

        } catch (error) {

            console.error(error);
        }
    };

    useEffect(() => {

        fetchUsers();
        fetchProfiles();

    }, []);

    /**
     * 🔎 FILTERS
     */
    useEffect(() => {

        let data = [...users];

        if (filters.search) {

            const s =
                filters.search.toLowerCase();

            data = data.filter(
                (u) =>
                    u.username
                        .toLowerCase()
                        .includes(s) ||
                    u.email
                        .toLowerCase()
                        .includes(s) ||
                    u.noms
                        .toLowerCase()
                        .includes(s)
            );
        }

        if (filters.profile) {

            data = data.filter(
                (u) =>
                    u.profile?.name ===
                    filters.profile
            );
        }

        setFiltered(data);
        setPage(1);

    }, [filters, users]);

    /**
     * ➕ CREATE USER
     */
    const handleCreateUser = async (
        data: CreateUserForm
    ) => {

        try {

            await createUser({
                username: data.username,
                password: data.password,
                email: data.email,
                noms: data.noms,
                profile: {
                    id: Number(data.profileId),
                },
            });

            toast.success(
                "Utilisateur ajouté"
            );

            setOpenModal(false);

            reset();

            fetchUsers();

        } catch (error: any) {

            toast.error(
                error.response?.data?.message ||
                "Erreur ajout utilisateur"
            );
        }
    };

    /**
     * 📄 PAGINATION
     */
    const totalPages = Math.ceil(
        filtered.length / limit
    );

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

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            openCreateModal()
                        }
                    >
                        + Ajouter utilisateur
                    </button>

                </div>

                {/* 🔎 FILTERS */}
                <div className="card bg-base-200 shadow-sm">

                    <div className="card-body">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            <input
                                className="input input-bordered w-full"
                                placeholder="Recherche..."
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                            />

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

                                <thead className="bg-base-200">

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
                                            <td colSpan={6} className="text-center py-10">
                                                <span className="loading loading-spinner loading-md"></span>
                                            </td>
                                        </tr>
                                    )}

                                    {/* 📭 EMPTY STATE */}
                                    {!loading && paginatedData.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12">

                                                <div className="flex flex-col items-center gap-2 opacity-70">

                                                    <Search className="w-8 h-8" />

                                                    <p className="font-semibold">
                                                        Aucun utilisateur trouvé
                                                    </p>

                                                    <p className="text-sm">
                                                        Essayez de modifier vos filtres ou d’ajouter un utilisateur
                                                    </p>

                                                </div>
                                            </td>

                                        </tr>
                                    )}

                                    {/* 📄 DATA */}
                                    {!loading &&
                                        paginatedData.map((u) => (
                                            <tr key={u.id} className="hover">

                                                <td>{u.id}</td>
                                                <td className="font-semibold">{u.username}</td>
                                                <td>{u.noms}</td>
                                                <td>{u.email}</td>

                                                <td>
                                                    <span className="badge badge-info">
                                                        {u.profile?.name}
                                                    </span>
                                                </td>

                                                <td className="text-center">
                                                    <div className="flex justify-center gap-2">

                                                        <button className="btn btn-ghost btn-xs">
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        <button className="btn btn-ghost btn-xs"
                                                            onClick={() => openEditModal(u)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>

                                                        <button className="btn btn-ghost btn-xs text-error"
                                                            onClick={() => handleDeleteUser(u.id)}

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

            {/* 🔥 MODAL */}
            {openModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">

                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-base-300 p-5">

                            <div>

                                <h2 className="text-xl font-bold">
                                    Ajouter utilisateur
                                </h2>

                                <p className="text-sm opacity-60">
                                    Création d'un nouveau compte
                                </p>

                            </div>

                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={() =>
                                    setOpenModal(false)
                                }
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

                        {/* BODY */}
                        <form
                            onSubmit={handleSubmit(
                                handleCreateUser
                            )}
                            className="p-5 space-y-4"
                            autoComplete="off"
                        >

                            {/* USERNAME */}
                            <div>

                                <input
                                    type="text"
                                    placeholder="Username"
                                    autoComplete="off"
                                    className="input input-bordered w-full"
                                    {...register("username")}

                                />

                                {errors.username && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.username.message}
                                    </p>
                                )}

                            </div>

                            {/* NOMS */}
                            <div>

                                <input
                                    type="text"
                                    placeholder="Noms"
                                    className="input input-bordered w-full"
                                    {...register("noms")}
                                />

                                {errors.noms && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.noms.message}
                                    </p>
                                )}

                            </div>

                            {/* EMAIL */}
                            <div>

                                <input
                                    type="email"
                                    placeholder="Email"
                                    autoComplete="off"
                                    className="input input-bordered w-full"
                                    {...register("email")}
                                />

                                {errors.email && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}

                            </div>

                            {/* PASSWORD */}
                            <div>

                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    autoComplete="off"
                                    className="input input-bordered w-full"
                                    {...register("password")}
                                />

                                {errors.password && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )}

                            </div>

                            {/* SEARCHABLE PROFILE */}
                            <div className="dropdown w-full">

                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-outline w-full justify-between"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                >

                                    {watch("profileId")
                                        ? profiles.find(
                                            (p) =>
                                                p.id ===
                                                Number(
                                                    watch("profileId")
                                                )
                                        )?.name
                                        : "Sélectionner un profil"}

                                    <ChevronDown size={16} />

                                </div>

                                <div
                                    tabIndex={0}
                                    className="dropdown-content z-[100] card card-compact w-full bg-base-100 shadow border border-base-300 mt-2"
                                >

                                    <div className="card-body p-2">

                                        {/* SEARCH */}
                                        <label className="input input-bordered flex items-center gap-2">

                                            <Search size={16} />

                                            <input
                                                type="text"
                                                className="grow w-full"
                                                placeholder="Rechercher profil..."
                                                value={profileSearch}
                                                onChange={(e) =>
                                                    setProfileSearch(
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </label>

                                        {/* LIST */}
                                        <div className="max-h-52 overflow-y-auto mt-2">

                                            {filteredProfiles.map((p) => (

                                                <button
                                                    type="button"
                                                    key={p.id}
                                                    className="btn btn-ghost justify-start w-full"
                                                    onClick={() => {
                                                        setValue("profileId", String(p.id), {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                        });

                                                        setProfileOpen(false); // ferme la liste
                                                    }}
                                                >
                                                    {p.name}
                                                </button>

                                            ))}
                                        </div>

                                    </div>

                                </div>

                                {errors.profileId && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.profileId.message}
                                    </p>
                                )}

                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-3 border-t border-base-300 pt-5 mt-5">

                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() =>
                                        setOpenModal(false)
                                    }
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Ajouter
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg">

                        {/* HEADER */}
                        <div className="flex justify-between p-5 border-b">
                            <h2 className="text-xl font-bold">
                                Modifier utilisateur
                            </h2>

                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={() => {
                                    setEditModal(false);
                                    setEditingUserId(null);
                                    resetEdit(); // ✅ FIX ICI
                                }}
                            >
                                <X />
                            </button>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmitEdit(handleUpdateUser)}
                            className="p-5 space-y-4"
                        >

                            {/* USERNAME */}
                            <div>
                                <input
                                    className="input input-bordered w-full"
                                    placeholder="Username"
                                    {...registerEdit("username")}
                                />
                                {errorsEdit.username && (
                                    <p className="text-error text-sm">
                                        {errorsEdit.username.message}
                                    </p>
                                )}
                            </div>

                            {/* NOMS */}
                            <div>
                                <input
                                    className="input input-bordered w-full"
                                    placeholder="Noms"
                                    {...registerEdit("noms")}
                                />
                                {errorsEdit.noms && (
                                    <p className="text-error text-sm">
                                        {errorsEdit.noms.message}
                                    </p>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <input
                                    className="input input-bordered w-full"
                                    placeholder="Email"
                                    {...registerEdit("email")}
                                />
                                {errorsEdit.email && (
                                    <p className="text-error text-sm">
                                        {errorsEdit.email.message}
                                    </p>
                                )}
                            </div>

                            {/* PROFILE */}
                            <div>
                                <select
                                    className="select select-bordered w-full"
                                    {...registerEdit("profileId")}
                                >
                                    <option value="">Profil</option>

                                    {profiles.map((p) => (
                                        <option
                                            key={p.id}
                                            value={Number(p.id)}
                                        >
                                            {p.name}
                                        </option>
                                    ))}
                                </select>

                                {errorsEdit.profileId?.message && (
                                    <p className="text-error text-sm">
                                        {String(errorsEdit.profileId.message)}
                                    </p>
                                )}
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-2 pt-4">

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setEditModal(false);
                                        setEditingUserId(null);
                                        resetEdit(); // ✅ FIX ICI
                                    }}
                                >
                                    Annuler
                                </button>

                                <button type="submit" className="btn btn-primary">
                                    Modifier
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}