import axios from "axios";

const API = axios.create({
  baseURL: "https://cyber-attack-detection-and-threat-fnth.onrender.com",
});

export default API;
