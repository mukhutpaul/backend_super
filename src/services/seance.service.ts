import { api } from "@/lib/axios";

/**
 * TYPES
 */
export type Seance = {
    id: number;
    dateSeance: string;
    dateFin?: string | null;   // 👈 optionnel
    isActive: boolean;

    chefEquipe?: {
        id: number;
        username?: string;
        noms?: string;
    };

    mission?: {
        id: number;
        zone?: string;
        numero?: string;
    };
};

/**
 * ➕ CREATE (heure non obligatoire)
 */
export type CreateSeancePayload = {
    missionId: number;
    chefEquipeId: number;
};

/**
 * ✏️ UPDATE
 */
export type UpdateSeancePayload = {
    dateSeance?: string;
    dateFin?: string | null;
    chefEquipeId?: number;
    missionId?: number;
    isActive?: boolean;
};

export const startSeance = async (id: number) => {
    const res = await api.put(`/seances/${id}/start`);
    return res.data;
};

export const finishSeance = async (id: number) => {
    const res = await api.put(`/seances/${id}/finish`);
    return res.data;
};

/**
 * 📥 GET ALL
 */
export const getSeances = async (): Promise<Seance[]> => {
    const res = await api.get("/seances");
    return res.data;
};

/**
 * 📥 GET BY ID
 */
export const getSeanceById = async (id: number): Promise<Seance> => {
    const res = await api.get(`/seances/${id}`);
    return res.data;
};

/**
 * 📥 BY MISSION
 */
export const getSeancesByMission = async (missionId: number): Promise<Seance[]> => {
    const res = await api.get(`/seances/mission/${missionId}`);
    return res.data;
};

/**
 * 📥 BY CHEF
 */
export const getSeancesByChef = async (chefId: number): Promise<Seance[]> => {
    const res = await api.get(`/seances/chef/${chefId}`);
    return res.data;
};

/**
 * ➕ CREATE
 */
export const createSeance = async (data: CreateSeancePayload) => {
    const res = await api.post("/seances", data);
    return res.data;
};

/**
 * ✏️ UPDATE
 */
export const updateSeance = async (id: number, data: UpdateSeancePayload) => {
    const res = await api.put(`/seances/${id}`, data);
    return res.data;
};

/**
 * 🗑 DELETE
 */
export const deleteSeance = async (id: number) => {
    const res = await api.delete(`/seances/${id}`);
    return res.data;
};