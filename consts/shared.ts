export const APP_NAME = 'shoofi';

export const ORDER_STATUS = {
  IN_PROGRESS: "1",
  COMPLETED: "2",
  WAITING_FOR_DRIVER: "3",
  CANCELLED: "4",
  REJECTED: "5",
  PENDING: "6",
  CANCELLED_BY_ADMIN: "7",
  CANCELLED_BY_CUSTOMER: "8",
  CANCELLED_BY_DRIVER: "9",
  PICKED_UP: "10",
  PICKED_UP_BY_DRIVER: "11",
  DELIVERED: "12",
};
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.COMPLETED]: "completed",
  [ORDER_STATUS.WAITING_FOR_DRIVER]: "waiting-for-driver",
  [ORDER_STATUS.COMPLETED]: "ready",
  [ORDER_STATUS.IN_PROGRESS]: "preparing",
  [ORDER_STATUS.CANCELLED]: "cancelled",
  [ORDER_STATUS.REJECTED]: "rejected",
  [ORDER_STATUS.PENDING]: "pending",
  [ORDER_STATUS.CANCELLED_BY_ADMIN]: "cancelled-by-admin",
  [ORDER_STATUS.CANCELLED_BY_CUSTOMER]: "cancelled-by-customer",
  [ORDER_STATUS.CANCELLED_BY_DRIVER]: "cancelled-by-driver",
  [ORDER_STATUS.PICKED_UP]: "picked-up",
  [ORDER_STATUS.PICKED_UP_BY_DRIVER]: "picked-up-by-driver",
  [ORDER_STATUS.DELIVERED]: "delivered",
};

export const DELIVERY_STATUS = {
  WAITING_FOR_APPROVE: "0",
  APPROVED: "1",
  COLLECTED_FROM_RESTAURANT: "2",
  DELIVERED: "3",
  CANCELLED_BY_DRIVER: "-1",
  CANCELLED_BY_STORE: "-2",
  CANCELLED_BY_ADMIN: "-3",
};
export const DELIVERY_STATUS_TEXT = {
  [DELIVERY_STATUS.WAITING_FOR_APPROVE]: "waiting-for-approve",
  [DELIVERY_STATUS.APPROVED]: "approved",
  [DELIVERY_STATUS.COLLECTED_FROM_RESTAURANT]: "picked-up-by-driver",
  [DELIVERY_STATUS.DELIVERED]: "delivered",
  [DELIVERY_STATUS.CANCELLED_BY_DRIVER]: "cancelled-by-driver",
};

//1 -SENT 3 -COMPLETE 2-READY 4-CANCELLED 5-REJECTED
export const inProgressStatuses = ["1","6"];
export const deliveryStatuses = ["3"];
export const readyStatuses = ["2"];
export const canceledStatuses = ["4", "5"];

export const SHIPPING_METHODS = {
  shipping: "DELIVERY",
  takAway: "TAKEAWAY",
  table: "TABLE",
};
export const PLACE = {
  current: "CURRENT",
  other: "OTHER",
};
export const PAYMENT_METHODS = {
  creditCard: "CREDITCARD",
  cash: "CASH",
};
export const ORDER_TYPE = {
  now: "NOW",
  later: "LATER",
};
export const animationDuration = 1500;

export const bcoindId = 3027;

export const cdnUrl = 'https://shoofi-spaces.fra1.cdn.digitaloceanspaces.com/';

export const devicesType = {
  tablet: 2
}

export const deliveryTime = [
  {
    label: 10,
    value: 10,
  },
  {
    label: 15,
    value: 15,
  },
  {
    label: 20,
    value: 20,
  },
  {
    label: 25,
    value: 25,
  },
  {
    label: 30,
    value: 30,
  },
  {
    label: 35,
    value: 35,
  },
  {
    label: 40,
    value: 40,
  },
  {
    label: 45,
    value: 45,
  },
];

export const reg_arNumbers = /^[\u0660-\u0669]{10}$/;
export const arabicNumbers = [
  /٠/g,
  /١/g,
  /٢/g,
  /٣/g,
  /٤/g,
  /٥/g,
  /٦/g,
  /٧/g,
  /٨/g,
  /٩/g,
];

export const openHour = 10;
export const closeHour = 23;


export const shmareemId = '647e63a81cef6b000d34be4c';
export const mkhbozeId = '6522f0d03d5b88000dbffed7';

export const canOrderOutOfStock = {
  "1":{
    "NOW": false,
    "LATER": true
  },
  "2":{
    "NOW": false,
    "LATER": false
  },
  "3":{
    "NOW": false,
    "LATER": false
  },
  "4":{
    "NOW": false,
    "LATER": false
  },
  "5":{
    "NOW": false,
    "LATER": true
  },
  "6":{
    "NOW": false,
    "LATER": false
  },
  "7":{
    "NOW": false,
    "LATER": true
  }
}

export const ROLES = {
  "all": "all",
  "cashier": "cashier",
  "print": "print"
}

export const mockOrderDelivery = {
  "_id": {
    "$oid": "64f4f149cde85f000d2f95ae"
  },
  "order": {
    "payment_method": "CASH",
    "receipt_method": "DELIVERY",
    "geo_positioning": {
      "latitude": 32.23972180447857,
      "longitude": 34.95463377789273
    },
    "items": [
      {
        "item_id": "647e63a81cef6b000d34be4c",
        "name": "עוגות שמרים",
        "nameAR": "كعكة شمريم",
        "nameHE": "עוגות שמרים",
        "qty": 1,
        "size": "medium",
        "taste": {
          "1": "notela"
        },
        "price": 38,
        "data": []
      },
      {
        "item_id": "647e64951cef6b000d34be52",
        "name": "שיש שוקולד",
        "nameAR": "شايش شوكلاتة ",
        "nameHE": "שיש שוקולד",
        "qty": 1,
        "size": "medium",
        "price": 38,
        "data": []
      },
      {
        "item_id": "647e651b1cef6b000d34be57",
        "name": "עוגות ריבת חלב",
        "nameAR": "كعكة الكراميل (ريبات حلاڤ)",
        "nameHE": "עוגות ריבת חלב",
        "qty": 1,
        "size": "large",
        "price": 150,
        "data": []
      }
    ]
  },
  "total": 246,
  "app_language": "0",
  "device_os": "iOS",
  "app_version": "0.0.2",
  "unique_hash": "5f40ed33413a57819db200e3dd6e2f23851da474",
  "datetime": "2023-09-03T20:49:13.109Z",
  "orderDate": "2023-09-04T09:30:00.000Z",
  "created": {
    "$date": "2023-09-03T20:49:13.412Z"
  },
  "customerId": "6457f6bee2e971000d6922d3",
  "orderId": "7129-886739-6701",
  "status": "1",
  "isPrinted": true,
  customerDetails: {
    name: "ساري",
    phone: "0542454361",
  },
}
export const mockOrderWithNotes = {
  "_id": {
    "$oid": "64fceb617c7ac6000d5b9778"
  },
  "order": {
    "payment_method": "CASH",
    "receipt_method": "TAKEAWAY",
    "items": [
      {
        "item_id": "64f8f51d788b957346440acf",
        "name": "עוגות ",
        "nameAR": "كعكة ",
        "nameHE": "עוגות ",
        "qty": 1,
        "note": "كعكه ابيض + مسح زهري + ريش + قلب\nكيند صغيره",
        "size": "medium",
        "price": "170",
        "data": []
      }
    ]
  },
  "total": 170,
  "app_language": "0",
  "device_os": "iOS",
  "app_version": "0.0.2",
  "unique_hash": "70e5427deb74fb663bbfb62e7de74fd9b5112f74",
  "datetime": "2023-09-09T22:02:08.972Z",
  "orderDate": "2023-09-11T07:00:00.000Z",
  "customerId": "64fceac07c7ac6000d5b9777",
  "created": {
    "$date": "2023-09-09T22:02:09.601Z"
  },
  "orderId": "7126-021202-1471",
  "status": "1",
  "isPrinted": false,
  customerDetails: {
    name: "ساري",
    phone: "0542454361",
  },
}
export const mockOrder = {
  "_id": {
    "$oid": "64f35e1bef691b000dbe43dc"
  },
  "order": {
    "payment_method": "CASH",
    "receipt_method": "TAKEAWAY",
    "items": [
      {
        "item_id": "647e63a81cef6b000d34be4c",
        "name": "עוגות שמרים",
        "nameAR": "كعكة شمريم",
        "nameHE": "עוגות שמרים",
        "qty": 1,
        "size": "medium",
        "taste": {
          "1": "notelaGozWhite"
        },
        "price": 38,
        "data": [],
        "clienImage": null
      },
      {
        "item_id": "647e651b1cef6b000d34be57",
        "name": "עוגות ריבת חלב",
        "nameAR": "كعكة الكراميل (ريبات حلاڤ)",
        "nameHE": "עוגות ריבת חלב",
        "qty": 1,
        "size": "large",
        "clienImage": {
          "uri": "orders/169367093924635F5DFCB-ACE4-4AFE-8956-2176202D575C.png"
        },
        "suggestedImage": null,
        "price": 150,
        "data": []
      }
    ]
  },
  "total": 188,
  "app_language": "0",
  "device_os": "iOS",
  "app_version": "0.0.2",
  "unique_hash": "6451968ba10afabdaae775b37379d608e28a49d8",
  "datetime": "2023-09-02T16:08:58.973Z",
  "orderDate": "2023-09-05T18:00:00.000Z",
  "customerId": "64e0ef0f075ddc298e67a53e",
  "created": {
    "$date": "2023-09-02T16:08:59.330Z"
  },
  "orderId": "7129-184292-0935",
  "status": "1",
  "isPrinted": true,
  customerDetails: {
    name: "ساري",
    phone: "0542454361",
  },
}
