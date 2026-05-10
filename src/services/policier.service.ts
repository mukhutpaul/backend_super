import { api } from "@/lib/axios";

export type Policier = {
    id: number;
    matricule: string;
    nom: string;
    postnom: string;
    prenom: string;
    sexe: string;
    telephone?: string;
    email?: string;
    statut: string;
};

type GetPoliciersParams = {
    page: number;
    size: number;
    search?: string;
    uniteId?: number;
};

export const getPoliciers = async (params: GetPoliciersParams) => {
    const res = await api.get("/policiers", {
        params,
    });

    return res.data;
};