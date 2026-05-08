import { api } from "@/lib/axios";

/**
 * =========================
 * TYPES
 * =========================
 */

export type Profile = {
  id: number;
  name: string;
};

export type CreateProfilePayload = {
  name: string;
};

export type UpdateProfilePayload = Partial<{
  name: string;
}>;

/**
 * =========================
 * GET ALL PROFILES
 * =========================
 */
export const getProfiles = async (): Promise<Profile[]> => {

  const response = await api.get("/profiles");

  return response.data;
};

/**
 * =========================
 * GET PROFILE BY ID
 * =========================
 */
export const getProfileById = async (
  id: number
): Promise<Profile> => {

  const response = await api.get(
    `/profiles/${id}`
  );

  return response.data;
};

/**
 * =========================
 * CREATE PROFILE
 * =========================
 */
export const createProfile = async (
  data: CreateProfilePayload
): Promise<Profile> => {

  const response = await api.post(
    "/profiles",
    data
  );

  return response.data;
};

/**
 * =========================
 * UPDATE PROFILE
 * =========================
 */
export const updateProfile = async (
  id: number,
  data: UpdateProfilePayload
): Promise<Profile> => {

  const response = await api.patch(
    `/profiles/${id}`,
    data
  );

  return response.data;
};

/**
 * =========================
 * DELETE PROFILE
 * =========================
 */
export const deleteProfile = async (
  id: number
) => {

  const response = await api.delete(
    `/profiles/${id}`
  );

  return response.data;
};