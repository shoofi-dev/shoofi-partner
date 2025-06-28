import { axiosInstance } from "../../utils/http-interceptor";
import {  ERROR_HANDLER } from "../../consts/api";

class ErrorHandlerStore {

  sendClientErrorFromServer = (data) => {
    const body = { ...data };
    return axiosInstance
      .post(
        `${ERROR_HANDLER.CONTROLLER}/${ERROR_HANDLER.INSERT_CLIENT_ERROR}`,
        body,
      )
      .then(function (response) {
        const res = response;
        return res;
      });
  }


  sendClientError = (data) => {
    return new Promise((resolve) => {
      this.sendClientErrorFromServer(data).then((res) => {
          resolve(true);
      })
    });
  }
}

export const errorHandlerStore = new ErrorHandlerStore();
