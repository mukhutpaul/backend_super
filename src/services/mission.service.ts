import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL + "/api/missions";

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
    const res = await axios.get(API, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return res.data;
};

/**
 * CREATE (mission pas encore active)
 */
export const createMission = async (data: CreateMissionPayload) => {
    const res = await axios.post(API, {
        ...data,
        isActive: false,
        dateDebut: null,
        dateFin: null,
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return res.data;
};

/**
 * UPDATE
 */
export const updateMission = async (id: number, data: UpdateMissionPayload) => {
    const res = await axios.put(`${API}/${id}`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return res.data;
};

/**
 * ❗ ACTIVER mission (START)
 */
export const startMission = async (id: number) => {
    const res = await axios.put(`${API}/${id}/start`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return res.data;
};

/**
 * ❗ CLÔTURER mission (END)
 */
export const closeMission = async (id: number) => {
    const res = await axios.put(`${API}/${id}/close`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return res.data;
};

/**
 * DELETE
 */
export const deleteMission = async (id: number) => {
    const res = await axios.delete(`${API}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    return res.data;
};