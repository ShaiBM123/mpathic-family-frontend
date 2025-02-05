import client from "./client";

const getData = async (endPoint: string) => await client.get(endPoint);

const getDatawithToken = async (endPoint: string, {}, headers?: Object) =>
  await client.get(endPoint, {}, headers);

const postData = async (endPoint: string, dataObj?: Object, headers?: Object) =>
  await client.post(endPoint, dataObj, headers);

const api = {getData, getDatawithToken, postData};

export default api;