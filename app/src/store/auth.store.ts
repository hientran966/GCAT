import { create } from "zustand";

interface AuthState {
  user: any;
  token: string | null;
  setAuth: (data: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (data) => {
    localStorage.setItem("token", data.access_token);
    set({ user: data.user, token: data.access_token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));