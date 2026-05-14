import {api} from "@/lib/axios";

export type LoginResponse = {
    token: string;
    username: string;
    profile?: string;

    userId: number;

    uniteId: number;

    missionId: number;

    equipeId: number;
};

export const chargerUnite = async (data: {
    uniteId: number;
    missionId: number;
    equipeId: number;
    userId: number;
}) => {

    const res = await api.post(
        "/unites/charger",
        data
    );

    return res.data;
};