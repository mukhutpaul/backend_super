import { api } from "@/lib/axios";

interface LoginResponse {
  token?: string;
  user?: any;
  message?: string;
}

export const logindistant = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>(
      "/auth/login-distant",
      {
        username,
        password
      }
    );

    return data;
  } catch (error: any) {
    console.error("Login error:", error?.response?.data || error.message);
    throw error;
  }
};