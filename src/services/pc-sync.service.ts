import { api } from "@/lib/axios";

export const syncPcData = async (
    chefId: number
) => {

    const response = await api.post(
        `/pc/sync/${chefId}`
    );

    return response.data;
};