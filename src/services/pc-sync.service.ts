import { api } from "@/lib/axios";

export const syncPcData = async (
    username: string,
    password: string
) => {

    const response = await api.post(
        `/pc/sync`,
        {
            username,
            password
        }
    );

    return response.data;
};