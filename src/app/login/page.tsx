"use client";

import { useState } from "react";
import { Lock, Server, Wifi } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

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

    const {
        register,
        handleSubmit,
    } = useForm<LoginForm>();


    /**
     * LOGIN
     */
    const onSubmit = async (data: LoginForm) => {

        try {

            // ✅ start loading
            setLoading(true);

            toast.info(
                `Connexion ${mode === "local"
                    ? "locale"
                    : "distante"} en cours...`
            );

            // ✅ sauvegarder mode
            localStorage.setItem("mode", mode);

            // ✅ requête API
            const response = await loginRequest(data);

            // ✅ sauvegarder token
            localStorage.setItem(
                "token",
                response.token
            );

            // ✅ username
            localStorage.setItem(
                "username",
                response.username
            );

            // ✅ profile
            localStorage.setItem(
                "profile",
                response.profile
            );

            // ✅ user complet
            localStorage.setItem(
                "user",
                JSON.stringify(response)
            );

            toast.success("Connexion réussie");

            // ✅ redirect dashboard
            window.location.href = "/dashboard";

        } catch (error: any) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Identifiants invalides"
            );

        } finally {

            // ✅ stop loading
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
                            PNC CONTROL MANAGER
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
                            className={`btn btn-sm flex-1 ${
                                mode === "local"
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