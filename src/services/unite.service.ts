import { api } from "@/lib/axios";

export type Unite = {
    id: number;
    name: string;
    signature?: string | null;
  
    commandant?: {
        uuid: string;
        name: string;
        firstname?: string;
        postname?: string;
    } | null;
};



export type CreateUnitePayload = {
    name: string;
    commandantId?: string;
    signature?: string;
};

export type UpdateUnitePayload = {
    name?: string;
    commandantId?: string;
    signature?: string;
};

// =========================
// GET ALL
// =========================
export const getUnites = async (): Promise<Unite[]> => {

    const response = await api.get("/unites");

    return response.data;
};

export const checkUniteExists = async (
    uniteId: number
): Promise<{ exists: boolean }> => {

    const response = await api.get(
        `/unites/exists/${uniteId}`
    );

    return response.data;
};




// =========================
// GET BY ID
// =========================
export const getUniteById = async (
    id: number
): Promise<Unite> => {

    const response = await api.get(`/unites/${id}`);

    return response.data;
};

// =========================
// CREATE
// =========================
export const createUnite = async (
    data: CreateUnitePayload
) => {

    const response = await api.post(
        "/unites",
        data
    );

    return response.data;
};

// =========================
// UPDATE
// =========================
export const updateUnite = async (
    id: number,
    data: UpdateUnitePayload
) => {

    const response = await api.patch(
        `/unites/${id}`,
        data
    );

    return response.data;
};

// =========================
// DELETE
// =========================
export const deleteUnite = async (
    id: number
) => {

    const response = await api.delete(
        `/unites/${id}`
    );

    return response.data;
};