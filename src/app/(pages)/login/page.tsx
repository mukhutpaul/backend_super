"use client";

import { useState } from "react";
import {
    Lock,
    Server,
    Wifi,
    MonitorSmartphone
} from "lucide-react";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { syncPcData } from "@/services/pc-sync.service";
import { loginRequest } from "@/services/auth.service";
import { REMOTE_API } from "@/lib/axios";

type LoginForm = {
    username: string;
    password: string;
};

export default function LoginPage() {

    const [mode, setMode] = useState<"local" | "remote">("local");
    const [loading, setLoading] = useState(false);

    // ✅ IP DU PC LOCAL
    const [localIp, setLocalIp] = useState("");

    const router = useRouter();

    const { register, handleSubmit } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {

        try {

            setLoading(true);

            toast.info(
                `Connexion ${mode === "local" ? "locale" : "distante"} en cours...`
            );

            localStorage.setItem("mode", mode);

            // =========================
            // LOGIN
            // =========================
            const response = await loginRequest(data);

            if (!response?.token) {
                throw new Error("Token invalide");
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("username", response.username ?? "");
            localStorage.setItem("profile", String(response.profile ?? null));

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...response,
                    profile: response.profile ?? null,
                })
            );

            // =========================
            // SYNC DISTANT
            // =========================
            let syncOk = true;

            if (mode === "remote") {

                // ✅ Vérifier IP locale
                if (!localIp || localIp.trim() === "") {

                    toast.warning(
                        "Veuillez renseigner l'adresse IP du PC local"
                    );

                    setLoading(false);
                    return;
                }

                try {

                    // =========================
                    // APPEL API DISTANTE
                    // =========================
                    const syncResponse = await syncPcData(
                        data.username,
                        data.password,
                        REMOTE_API
                    );

                    console.log("SYNC RESPONSE", syncResponse);

                    // =========================
                    // STOCKAGE FRONT
                    // =========================
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

                    // =========================
                    // ENVOI AU BACK LOCAL
                    // =========================
                    try {

                        const localApi =
                            `http://${localIp}:8090/api/pc/sync-local`;

                        console.log("LOCAL API =", localApi);

                        const localResponse = await fetch(localApi, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(syncResponse.data),
                        });

                        if (!localResponse.ok) {
                            throw new Error("Erreur sync local");
                        }

                        console.log("SYNC LOCAL OK");

                        toast.success(
                            "Données enregistrées sur le serveur local"
                        );

                    } catch (localError) {

                        console.error(
                            "Erreur serveur local",
                            localError
                        );

                        toast.warning(
                            "Connexion distante OK mais stockage local échoué"
                        );
                    }

                    toast.success("Synchronisation réussie");

                } catch (syncError: any) {

                    if (syncError.response?.status === 401) {

                        toast.warning(
                            "Identifiants invalides"
                        );
                    }

                    console.error("Erreur sync", syncError);

                    syncOk = false;

                    toast.warning(
                        "Connexion OK mais synchronisation échouée"
                    );
                }
            }

            // =========================
            // REDIRECTION
            // =========================
            if (mode === "remote" && !syncOk) {
                return;
            }

            toast.success("Connexion réussie");

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

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setMode("local")}
                            className={`btn btn-sm flex-1 ${
                                mode === "local"
                                    ? "btn-primary"
                                    : "btn-outline"
                            }`}
                        >
                            <Server size={16} />
                            Local
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setMode("remote")}
                            className={`btn btn-sm flex-1 ${
                                mode === "remote"
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

                        {/* ✅ IP LOCAL */}
                        {mode === "remote" && (

                            <div className="form-control">

                                <label className="label">
                                    <span className="label-text flex items-center gap-2">
                                        <MonitorSmartphone size={16} />
                                        IP du serveur local
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    disabled={loading}
                                    value={localIp}
                                    onChange={(e) =>
                                        setLocalIp(e.target.value)
                                    }
                                    className="input input-bordered w-full"
                                    placeholder="192.168.1.10"
                                />

                                <label className="label">
                                    <span className="label-text-alt opacity-70">
                                        Exemple :
                                        192.168.1.10
                                    </span>
                                </label>

                            </div>
                        )}

                        {/* MODE INFO */}
                        <div className="text-xs opacity-60 flex items-center gap-2 mt-2">

                            <Lock size={14} />

                            <span>Mode actif :</span>

                            <span className="font-semibold">
                                {mode === "local"
                                    ? "Serveur local"
                                    : "Serveur central"}
                            </span>

                        </div>

                        {/* BUTTON */}
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