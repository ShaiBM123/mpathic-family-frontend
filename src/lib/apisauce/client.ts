import { create } from "apisauce";
// export const base_url = "https://mpathic-family.herokuapp.com/mpathic_famliy/api/";
export const base_url ="http://localhost:5000/mpathic_famliy/api/";

const apiClient = create({
  // baseURL: "https://mpathic-family.herokuapp.com/mpathic_famliy/api/",
  baseURL: "http://localhost:5000/mpathic_famliy/api/",
});

export default apiClient;