import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://eneida-junctional-ava.ngrok-free.dev";

export default (baseURL) => {

  const instance = axios.create({
    baseURL: API_URL + baseURL,
    headers: {
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use(
    async (config) => {

      const token = await AsyncStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      } else {
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};