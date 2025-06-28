import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { ORDER_API, CUSTOMER_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import { orderBy } from "lodash";
import { ORDER_STATUS, SHIPPING_METHODS } from "../../consts/shared";
import { storeDataStore } from "../store";
import { shoofiAdminStore } from "../shoofi-admin";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const inProgressStatuses = ["SENT", "APPROVED"];

class OrdersStore {
  ordersList = null;
  statusCount = null;
  totalOrderItems = 0;
  orderType = null;
  editOrderData = null;
  notViewdOrders = null;

  constructor() {
    makeAutoObservable(this);
  }

  getOrdersFromServer = async (
    isAdmin?: boolean,
    statusList?,
    ordersDate?,
    isNotPrinted?,
    pageNumber?,
    isNotViewd?
  ) => {
    const api = isAdmin
      ? `${ORDER_API.CONTROLLER}/${ORDER_API.GET_ADMIN_ORDERS_API}`
      : `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.GET_CUSTOMER_ORDERS_API}`;
    return axiosInstance
      .post(api, {
        statusList,
        ordersDate,
        isNotPrinted,
        pageNumber,
        isNotViewd,
        isOrderLaterSupport: storeDataStore.storeData?.isOrderLaterSupport,
      })
      .then(function (response: any) {
        return response;
      });
  };

  getOrders = (
    isAdmin?: boolean,
    statusList?,
    ordersDate?,
    isNotPrinted?,
    pageNumber?,
    isOrdersPage?,
    isNotViewd?
  ) => {
    if (isOrdersPage) {
      this.totalOrderItems = null;
    }
    return this.getOrdersFromServer(
      isAdmin,
      statusList,
      ordersDate,
      isNotPrinted,
      pageNumber,
      isNotViewd
    ).then((res) => {
      // const orderedList = orderBy(res.orders, ["created_at"], ["desc"]);
      const tmpOrders = res.data || res;
      runInAction(() => {
        if (!isNotPrinted) {
          this.ordersList = tmpOrders?.ordersList;
          this.statusCount = tmpOrders?.statusCount;
          this.totalOrderItems = res.totalItems;
        }
      });
      return tmpOrders?.ordersList;
    });
  };

  getNotPrintedFromServer = async () => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.GET_ADMIN_NOT_PRINTED_ORDERS_API}`;

    return axiosInstance.get(api).then(function (response: any) {
      return response;
    });
  };

  getNotPrintedOrders = () => {
    return this.getNotPrintedFromServer().then((res) => {
      const tmpOrders = res.data || res;
      return tmpOrders;
    });
  };

  getNotViewdOrdersFromServer = async (isAdminAll: boolean) => {
    const api = `${ORDER_API.CONTROLLER}/${
      isAdminAll
        ? ORDER_API.GET_ADMIN_ALL_NOT_VIEWD_ORDERS_API
        : ORDER_API.GET_ADMIN_NOT_VIEWD_ORDERS_API
    }`;
    const storeDB = await AsyncStorage.getItem("@storage_storeDB");

    return axiosInstance
      .get(api, {
        headers: {
          "app-name": storeDB,
        },
      })
      .then(function (response: any) {
        return response;
      });
  };

  getNotViewdOrders = (isAdminAll: boolean) => {
    return this.getNotViewdOrdersFromServer(isAdminAll).then((res) => {
      runInAction(() => {
        this.notViewdOrders = res.data || res;
      });
      const tmpOrders = res.data || res;
      return tmpOrders;
    });
  };

  getCustomerInvoicesFromServer = async () => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.GET_CUSTOMER_INVOICES_API}`;

    return axiosInstance.get(api).then(function (response: any) {
      return response;
    });
  };

  getCustomerInvoices = () => {
    return this.getCustomerInvoicesFromServer().then((res) => {
      const invoicesList = res.data || res;
      return invoicesList;
    });
  };

  getCustomerOrdersFromServer = async () => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.GET_CUSTOMER_ORDERS_API}`;

    return axiosInstance.get(api).then(function (response: any) {
      return response;
    });
  };

  getCustomerOrders = () => {
    return this.getCustomerOrdersFromServer().then((res) => {
      const customerOrdersList = res;
      return customerOrdersList;
    });
  };

  getCustomerActiveOrdersFromServer = async () => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.GET_CUSTOMER_ACTIVE_ORDERS_API}`;

    return axiosInstance.get(api).then(function (response: any) {
      return response;
    });
  };

  getCustomerActiveOrders = () => {
    return this.getCustomerActiveOrdersFromServer().then((res) => {
      const customerOrdersList = res;
      return customerOrdersList;
    });
  };

  updateOrderStatusServer = async (
    status: string,
    orderId: string,
    shouldSendSms: boolean
  ) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_ADMIN_ORDERS_API}`;
    const body = {
      updateData: { status, shouldSendSms },
      orderId,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };

  downloadImage = (url: string) => {
    return axiosInstance.get(url).then(function (response: any) {
      return response;
    });
  };

  updateOrderStatus = async (order: any, shouldSendSms = true) => {
    console.log("order.status",order.status)
    switch (order.status) {
      case ORDER_STATUS.IN_PROGRESS:
        if (order.order.receipt_method == SHIPPING_METHODS.shipping) {
          await this.updateOrderStatusServer(ORDER_STATUS.WAITING_FOR_DRIVER, order._id, shouldSendSms);
        } else {
          await this.updateOrderStatusServer(ORDER_STATUS.COMPLETED, order._id, shouldSendSms);
        }
        break;
      case ORDER_STATUS.WAITING_FOR_DRIVER:
        await this.updateOrderStatusServer(ORDER_STATUS.COMPLETED, order._id, shouldSendSms);
        break;
      case ORDER_STATUS.COMPLETED:
        if (order.order.receipt_method == SHIPPING_METHODS.shipping) {
          await this.updateOrderStatusServer(ORDER_STATUS.PICKED_UP_BY_DRIVER, order._id, shouldSendSms);
        } else {
          await this.updateOrderStatusServer(ORDER_STATUS.PICKED_UP, order._id, shouldSendSms);
        }
        break;
      case ORDER_STATUS.PICKED_UP:      
        await this.updateOrderStatusServer(ORDER_STATUS.CANCELLED, order._id, shouldSendSms);
        break;
      default:
        return;
    }
    // this.getOrders(true, [order.status]);
  };

  updatOrderViewdServer = async (
    flag: boolean,
    orderId: string,
    isAdminAll: boolean,
    currentTime: any,
    readyMinutes: number,
    isOrderLaterSupport: any
  ) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_ADMIN_ORDERS_VIEWD_API}`;
    const updateData = isAdminAll
      ? {
          isViewdAdminAll: flag,
          isViewd: flag,
          currentTime,
          readyMinutes,
          isOrderLaterSupport,
        }
      : { isViewd: flag, currentTime, readyMinutes, isOrderLaterSupport };

    const body = {
      updateData,
      orderId,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };
  updatOrderViewd = async (
    order: any,
    isAdminAll: boolean,
    currentTime: any,
    readyMinutes: number,
    isOrderLaterSupport: any
  ) => {
    this.updatOrderViewdServer(
      true,
      order._id,
      isAdminAll,
      currentTime,
      readyMinutes,
      isOrderLaterSupport
    );
  };

  bookDeliveryServer = async (flag: boolean, orderId: string) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_ADMIN_ORDERS_BOOK_DELIVERY_API}`;
    const body = {
      updateData: { isDeliverySent: flag },
      orderId,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };
  bookDelivery = async (order: any) => {
    this.bookDeliveryServer(true, order._id);
  };

  bookCustomDeliveryServer = async (deliveryData: any) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.CREATE_ADMIN_ORDERS_BOOK_CUSTOM_DELIVERY_API}`;
    const body = {
      deliveryData,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };
  bookCustomDelivery = async (deliveryData: any) => {
    return this.bookCustomDeliveryServer(deliveryData);
  };

  updateCustomDeliveryServer = async (updateData: any) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_ADMIN_ORDERS_BOOK_CUSTOM_DELIVERY_API}`;
    const body = {
      updateData,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };
  updateCustomDelivery = async (updateData: any) => {
    return this.updateCustomDeliveryServer(updateData);
  };

  getCustomDeliveryListServer = async (isAll) => {
    const body = {
      isAll,
    };
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.GET_ADMIN_ORDERS_BOOK_CUSTOM_DELIVERY_API}`;
    return axiosInstance.post(api, body).then(function (response: any) {
      return response;
    });
  };
  getCustomDeliveryList = async (isAll) => {
    return this.getCustomDeliveryListServer(isAll);
  };

  updateOrderToPrevStatus = async (order: any) => {
    switch (order.status) {
      case "2":
      case "3":
      case "4":
        await this.updateOrderStatusServer("1", order._id);
        break;
      default:
        return;
    }
    // this.getOrders(true, [order.status]);
  };

  updateOrderNoteServer = async (note: string, orderId: string) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_ADMIN_ORDERS_API}`;
    const body = {
      updateData: { note },
      orderId,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };

  updateOrderNote = async (order: any, orderNoteText: string) => {
    return this.updateOrderNoteServer(orderNoteText, order._id).then((res) => {
      return res;
    });
    // this.getOrders(true, [order.status]);
  };

  addOrderRefundServer = async (data: any, orderId: string) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.ADD_REFUND_API}`;
    const body = {
      refundObj: data,
      orderId,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      return response;
    });
  };

  addOrderRefund = async (data: any, order) => {
    return this.addOrderRefundServer(data, order._id).then((res) => {
      return res;
    });
  };

  updateOrderPrintedServer = async (orderId: string, status: boolean) => {
    const api = `${ORDER_API.CONTROLLER}/${ORDER_API.PRINTED_ADMIN_ORDERS_API}`;
    const body = {
      orderId,
      status,
    };
    return axiosInstance.post(api, body).then(function (response: any) {
      // const res = JSON.parse(fromBase64(response.data));
      return response;
    });
  };

  updateOrderPrinted = async (orderId: any, status: boolean) => {
    // await this.updateOrderPrintedServer(orderId, status);
    return this.updateOrderPrintedServer(orderId, status).then((res) => {
      return res;
    });
    //this.getOrders(true,[status]);
  };

  isActiveOrders = () => {
    const founded = this.ordersList?.find((order) => {
      if (inProgressStatuses.indexOf(order.status) > -1) {
        return true;
      }
    });
    return !!founded;
  };

  resetOrdersList = () => {
    this.ordersList = [];
  };

  setOrderType = (orderType) => {
    this.orderType = orderType;
  };

  setEditOrderData = (order) => {
    this.editOrderData = order;
  };

  getDeliveryByBookId = async (bookId: string) => {
    const api = `/delivery/book/${bookId}`;
    return axiosInstance.get(api).then(function (response: any) {
      return response.data || response;
    });
  };
}

export const ordersStore = new OrdersStore();
