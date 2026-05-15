"use client";

import { useState } from "react";
import { Lock, Server, Wifi } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { syncPcData } from "@/services/pc-sync.service";


import { loginRequest } from "@/services/auth.service";

type LoginForm = {
    username: string;
    password: string;
};

export default function LoginPage() {

    const [mode, setMode] = useState<"local" | "remote">(
        "local"
    );

    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const {
        register,
        handleSubmit,
    } = useForm<LoginForm>();


    /**
     * LOGIN
     */
    const onSubmit = async (data: LoginForm) => {

        try {

            setLoading(true);

            toast.info(
                `Connexion ${mode === "local"
                    ? "locale"
                    : "distante"
                } en cours...`
            );

            // =========================
            // SAVE MODE
            // =========================

            localStorage.setItem(
                "mode",
                mode
            );

            // =========================
            // LOGIN API
            // =========================

            const response =
                await loginRequest(data);

            // =========================
            // VALIDATION
            // =========================

            if (!response?.token) {

                throw new Error(
                    "Token invalide"
                );
            }

            // =========================
            // TOKEN
            // =========================

            localStorage.setItem(
                "token",
                response.token
            );

            // =========================
            // USERNAME
            // =========================

            localStorage.setItem(
                "username",
                response.username ?? ""
            );

            // =========================
            // PROFILE
            // =========================

            localStorage.setItem(
                "profile",
                String(
                    response.profile ?? null
                )
            );

            // =========================
            // USER
            // =========================

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...response,
                    profile:
                        response.profile ?? null,
                })
            );

            // =========================
            // REMOTE SYNC
            // =========================

            let syncOk = true;

            if (mode === "remote") {

                try {

                    const syncResponse = await syncPcData(
                        data.username,
                        data.password
                    );

                    console.log("SYNC RESPONSE", syncResponse);

                    if (syncResponse?.data) {

                        localStorage.setItem(
                            "chefEquipe",
                            JSON.stringify(syncResponse.data.chefEquipe)
                        );

                        localStorage.setItem(
                            "equipe",
                            JSON.stringify(syncResponse.data.equipe)
                        );

                        localStorage.setItem(
                            "mission",
                            JSON.stringify(syncResponse.data.mission)
                        );

                        localStorage.setItem(
                            "users",
                            JSON.stringify(syncResponse.data.users ?? [])
                        );

                        localStorage.setItem(
                            "unites",
                            JSON.stringify(syncResponse.data.unites ?? [])
                        );
                    }

                    toast.success("Synchronisation réussie");

                } catch (syncError) {

                    console.error("Erreur sync", syncError);

                    syncOk = false;

                    toast.warning("Connexion OK mais synchronisation échouée");
                }
            }

            // =========================
            // SUCCESS
            // =========================

            toast.success(
                "Connexion réussie"
            );

            router.push("/dashboard");

        } catch (error: any) {

            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Identifiants invalides"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">

            <div className="card w-full max-w-md shadow-2xl bg-base-100">

                <div className="card-body">

                    {/* HEADER */}
                    <div className="text-center mb-6">

                        <h1 className="text-3xl font-bold text-primary">
                            ABA-CM PNC
                        </h1>

                        <p className="text-sm opacity-60 mt-1">
                            Authentification sécurisée
                        </p>

                    </div>

                    {/* MODE */}
                    <div className="flex gap-2 mb-5">

                        {/* LOCAL */}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setMode("local")}
                            className={`btn btn-sm flex-1 ${mode === "local"
                                ? "btn-primary"
                                : "btn-outline"
                                }`}
                        >
                            <Server size={16} />
                            Local
                        </button>

                        {/* REMOTE */}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setMode("remote")}
                            className={`btn btn-sm flex-1 ${mode === "remote"
                                ? "btn-primary"
                                : "btn-outline"
                                }`}
                        >
                            <Wifi size={16} />
                            Distant
                        </button>

                    </div>

                    {/* FORM */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >

                        {/* USERNAME */}
                        <div className="form-control">

                            <label className="label">
                                <span className="label-text">
                                    Nom d'utilisateur
                                </span>
                            </label>

                            <input
                                type="text"
                                disabled={loading}
                                {...register("username", {
                                    required: true,
                                })}
                                className="input input-bordered w-full"
                                placeholder="Entrer votre identifiant"
                            />

                        </div>

                        {/* PASSWORD */}
                        <div className="form-control">

                            <label className="label">
                                <span className="label-text">
                                    Mot de passe
                                </span>
                            </label>

                            <input
                                type="password"
                                disabled={loading}
                                {...register("password", {
                                    required: true,
                                })}
                                className="input input-bordered w-full"
                                placeholder="••••••••"
                            />

                        </div>

                        {/* MODE INFO */}
                        <div className="text-xs opacity-60 flex items-center gap-2 mt-2">

                            <Lock size={14} />

                            <span>
                                Mode actif :
                            </span>

                            <span className="font-semibold">
                                {mode === "local"
                                    ? "Serveur local"
                                    : "Serveur central"}
                            </span>

                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full mt-4"
                        >

                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Connexion...
                                </>
                            ) : (
                                "Se connecter"
                            )}

                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}