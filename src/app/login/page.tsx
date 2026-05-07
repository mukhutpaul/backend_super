"use client";

import { useState } from "react";
import { Lock, Server, Wifi } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";


type LoginForm = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const [mode, setMode] = useState<"local" | "remote">(
    "remote"
  );

  const { register, handleSubmit } =
    useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    toast.success(
      `Connexion ${mode === "local" ? "locale" : "distante"} en cours...`
    );

    console.log({
      ...data,
      mode,
    });

    // 👉 ici tu brancheras Spring Boot API
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">

      <div className="card w-full max-w-md shadow-2xl bg-base-100">

        {/* HEADER */}
        <div className="card-body">

          <div className="text-center mb-4">

            <h1 className="text-2xl font-bold text-primary">
              PNC CONTROL MANAGER
            </h1>

            <p className="text-sm opacity-60">
              Authentification sécurisée
            </p>

          </div>

          {/* MODE SELECT */}
          <div className="flex gap-2 mb-4">

            <button
              type="button"
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
            className="space-y-3"
          >

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Nom d'utilisateur
                </span>
              </label>

              <input
                type="text"
                {...register("username")}
                className="input input-bordered w-full"
                placeholder="Entrer votre identifiant"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Mot de passe
                </span>
              </label>

              <input
                type="password"
                {...register("password")}
                className="input input-bordered w-full"
                placeholder="••••••••"
              />
            </div>

            {/* INFO MODE */}
            <div className="text-xs opacity-60 flex items-center gap-2 mt-2">
              <Lock size={14} />
              Mode actif :
              <span className="font-semibold">
                {mode === "local"
                  ? "Serveur local"
                  : "Serveur central"}
              </span>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
            >
              Se connecter
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}