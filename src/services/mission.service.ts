import { api } from "@/lib/axios"

/**
 * TYPES
 */
export type Mission = {
    id: number;
    dateDebut: string | null;
    dateFin: string | null;
    zone: string;
    numero: string;
    isActive: boolean;
    chargeMission?: {
        id: number;
        username?: string;
        noms?: string;
    };
};

export type CreateMissionPayload = {
    zone: string;
    numero: string;
    chargeMissionId: number;
};

export type UpdateMissionPayload = {
    zone?: string;
    numero?: string;
    chargeMissionId?: number;
};

/**
 * GET ALL
 */
export const getMissions = async (): Promise<Mission[]> => {
    const res = await api.get("/missions");
    return res.data;
};

export const getUnitesByMission = async (missionId: number) => {

    const res = await api.get(
        `/mission-unites/${missionId}/unites`
    );

    return res.data;
};
/**
 * CREATE
 */
export const createMission = async (data: CreateMissionPayload) => {
    const res = await api.post("/missions", {
        ...data,
        isActive: false,
        dateDebut: null,
        dateFin: null,
    });

    return res.data;
};

/**
 * UPDATE
 */
export const updateMission = async (id: number, data: UpdateMissionPayload) => {
    const res = await api.put(`/missions/${id}`, data);
    return res.data;
};

/**
 * START
 */
export const startMission = async (id: number) => {
    const res = await api.put(`/missions/${id}/start`);
    return res.data;
};

/**
 * CLOSE
 */
export const closeMission = async (id: number) => {
    const res = await api.put(`/missions/${id}/close`);
    return res.data;
};

/**
 * DELETE
 */
export const deleteMission = async (id: number) => {
    const res = await api.delete(`/missions/${id}`);
    return res.data;
};