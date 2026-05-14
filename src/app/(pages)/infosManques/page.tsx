"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Controle } from "@/services/controle.service";

type Policier = {
    matricule: string;
    nom?: string;
    postnom?: string;
    prenom?: string;
    sexe?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
    villeNaissance?: string;
    villageNaissance?: string;
    paysDeNaissance?: string;
    telephone?: string;
    email?: string;
    unite?: string;
    adresse?: string;
    groupeSanguin?: string;
    profession?: string;
};

export default function PolicierFormPage() {

    const [loading, setLoading] = useState(false);
    const [policier, setPolicier] = useState<Policier | null>(null);

    const [searchMatricule, setSearchMatricule] = useState("");

    const [searchNom, setSearchNom] = useState("");
    const [searchPostnom, setSearchPostnom] = useState("");
    const [searchPrenom, setSearchPrenom] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [selectedControle, setSelectedControle] = useState<Controle | null>(null);

    const handleSearch = async () => {
        try {
            setLoading(true);

            const res = await api.get("/policiers/search", {
                params: {
                    matricule: searchMatricule || undefined,
                    nom: searchNom || undefined,
                    postnom: searchPostnom || undefined,
                    prenom: searchPrenom || undefined,
                    dateNaissance: searchDate || undefined,
                },
            });

            setPolicier(res.data);

        } catch (e) {
            toast.error("Policier introuvable");
            setPolicier(null);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (key: keyof Policier, value: string) => {
        if (!policier) return;

        setPolicier({
            ...policier,
            [key]: value,
        });
    };

    const renderInput = (
        label: string,
        key: keyof Policier
    ) => {
        const value = policier?.[key];

       const isLocked = !!selectedControle?.present;

        return (
            <div className="form-control">
                <label className="label">
                    <span className="label-text">{label}</span>
                </label>

                <input
                    className="input input-bordered"
                    value={value || undefined}
                    readOnly={isLocked}
                    onChange={(e) => updateField(key, e.target.value)}
                />
            </div>
        );
    };

    return (
         <DashboardLayout>
        <div className="p-6 space-y-6">

            <h1 className="text-2xl font-bold">
                Recherche Policier
            </h1>

            {/* SEARCH */}
            <div className="card bg-base-200 p-4 space-y-4">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                    <input
                        className="input input-bordered"
                        placeholder="Matricule"
                        value={searchMatricule}
                        onChange={(e) => setSearchMatricule(e.target.value)}
                    />

                    <input
                        className="input input-bordered"
                        placeholder="Nom"
                        value={searchNom}
                        onChange={(e) => setSearchNom(e.target.value)}
                    />

                    <input
                        className="input input-bordered"
                        placeholder="Postnom"
                        value={searchPostnom}
                        onChange={(e) => setSearchPostnom(e.target.value)}
                    />

                    <input
                        className="input input-bordered"
                        placeholder="Prenom"
                        value={searchPrenom}
                        onChange={(e) => setSearchPrenom(e.target.value)}
                    />

                </div>

                <input
                    className="input input-bordered w-full"
                    placeholder="Date naissance (YYYY-MM-DD)"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                />

                <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? "Recherche..." : "Rechercher"}
                </button>

            </div>

            {/* FORM */}
            {policier && (
                <div className="card bg-base-100 shadow-xl p-6">

                    <h2 className="text-xl font-bold mb-4">
                        Fiche Policier
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {renderInput("Matricule", "matricule")}
                        {renderInput("Nom", "nom")}
                        {renderInput("Postnom", "postnom")}
                        {renderInput("Prenom", "prenom")}
                        {renderInput("Sexe", "sexe")}
                        {renderInput("Date Naissance", "dateNaissance")}
                        {renderInput("Lieu Naissance", "lieuNaissance")}
                        {renderInput("Ville Naissance", "villeNaissance")}
                        {renderInput("Village Naissance", "villageNaissance")}
                        {renderInput("Pays Naissance", "paysDeNaissance")}
                        {renderInput("Téléphone", "telephone")}
                        {renderInput("Email", "email")}
                        {renderInput("Unité", "unite")}
                        {renderInput("Adresse", "adresse")}
                        {renderInput("Groupe Sanguin", "groupeSanguin")}
                        {renderInput("Profession", "profession")}

                    </div>

                    <div className="mt-6 flex gap-2">
                        <button className="btn btn-success">
                            Enregistrer
                        </button>

                        <button
                            className="btn btn-outline"
                            onClick={() => setPolicier(null)}
                        >
                            Annuler
                        </button>
                    </div>

                </div>
            )}

        </div>
        </DashboardLayout>
    );
}