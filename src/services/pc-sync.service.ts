import { api } from "@/lib/axios";

export const syncPcData = async (
    username: string,
    password: string,
    baseUrl: string // 👈 IP envoyée depuis le frontend
) => {

    const response = await api.post(
        `/pc/sync`,
        {
            username,
            password,
            baseUrl // 👈 IMPORTANT
        }
    );

    return response.data;
};