import axios from "axios";

const API = axios.create({
  baseURL: "https://e-learning-smbe.onrender.com/api", // Thay bằng link deploy nếu có
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (identifier: string, password: string) => {
    try {
        const res = await API.post(
            "/auth/local?populate=role", // ✅ Gắn trực tiếp ở đây
            { identifier, password }
          );
          return res.data;
      }catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message || "Unknown login error";
      throw new Error(errorMessage); // ✅ Luôn throw Error instance
    }
  };
  
