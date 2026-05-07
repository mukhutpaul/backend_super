import { api } from "@/lib/axios";

type LoginPayload = {
  username: string;
  password: string;
};

export const loginRequest = async (
  data: LoginPayload
) => {

  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

export const logout = () => {

  // supprimer token
  localStorage.removeItem("token");

  // supprimer user
  localStorage.removeItem("user");
  localStorage.removeItem("username");
  localStorage.removeItem("profile");

  // supprimer mode
  localStorage.removeItem("mode");

  // redirect login
  window.location.href = "/login";
};