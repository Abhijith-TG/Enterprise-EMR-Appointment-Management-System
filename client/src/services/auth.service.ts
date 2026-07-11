import { api, setAccessToken } from "./api.js";

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post("/auth/login", credentials);
    const { accessToken, user } = response.data.data;
    setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    return { accessToken, user };
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
