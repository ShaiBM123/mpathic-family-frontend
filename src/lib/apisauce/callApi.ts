import client from "./client";

const getBaseUrl = () => {
  const hostIp = process.env.REACT_APP_HOST_IP || "localhost";
  return `http://${hostIp}:5000/mpathic_famliy/api/`;
};

const getData = async (endPoint: string) => {
  client.setBaseURL(getBaseUrl()); // Set the base URL dynamically
  return await client.get(endPoint);
}

const getDatawithToken = async (endPoint: string, dataObj?: Object, headers?: Object) => {
  client.setBaseURL(getBaseUrl()); // Set the base URL dynamically
  return await client.get(endPoint, dataObj, headers);
}

const postData = async (endPoint: string, dataObj?: Object, headers?: Object) => {
  client.setBaseURL(getBaseUrl()); // Set the base URL dynamically
  return await client.post(endPoint, dataObj, headers);
}

const api = { getData, getDatawithToken, postData };

export default api;