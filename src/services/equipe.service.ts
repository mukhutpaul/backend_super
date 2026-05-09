// src/services/equipe.service.ts

import {api} from "@/lib/axios";

export interface Equipe {
  id?: number;
  user?: {
    id: number;
    [key: string]: any;
  };
  mission?: {
    id: number;
    [key: string]: any;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const equipeService = {
  create: async (data: Equipe): Promise<Equipe> => {
    const response = await api.post("/equipes", data);
    return response.data;
  },



  getAll: async (): Promise<Equipe[]> => {
    const response = await api.get("/equipes");
    return response.data;
  },

  getById: async (id: number): Promise<Equipe> => {
    const response = await api.get(`/equipes/${id}`);
    return response.data;
  },

  update: async (id: number, data: Equipe): Promise<Equipe> => {
    const response = await api.put(`/equipes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<string> => {
    const response = await api.delete(`/equipes/${id}`);
    return response.data;
  },
};

export default equipeService;

export const getEquipes = async (): Promise<Equipe[]> => {
    const res = await api.get("/equipes");
    return res.data;
};

export const getUnitesByEquipe = async (equipeId: number) => {
    const response = await api.get(`/equipe-unites/${equipeId}/unites`);
    return response.data;
};