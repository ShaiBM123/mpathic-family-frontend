import { create } from "apisauce";

const getBaseUrl = () => {
  return `http://localhost:5000/mpathic_famliy/api/`;
};

// const getBaseUrl = () => {
//   return `http://13.53.219.229:5000/mpathic_famliy/api/`;
// };

const apiClient = create({
  baseURL: getBaseUrl(), // Call the function to get the base URL
});

export default apiClient;