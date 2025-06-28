/*

Concept: https://dribbble.com/shots/5476562-Forgot-Password-Verification/attachments

*/
import { Animated, Image, SafeAreaView, Text, View } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import i18n from "../../translations/i18n";
import InvoiceOrderItems from "./invoice-order-items";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../../consts/shared";
import { StoreContext } from "../../stores";
import getPizzaCount from "../../helpers/get-pizza-count";

const OrderInvoiceCMP = ({ invoiceOrder }) => {
  const { storeDataStore } = useContext(StoreContext);

  const getOrderId = (orderId) => {
    const orderIdSplit = orderId.split("-");
    const idPart1 = orderIdSplit[0];
    const idPart2 = orderIdSplit[2];
    return `${idPart1}-${idPart2}`;
  };

  const getOrderTotalPrice = (order) => {
    return order?.total;
  };

  return (
    invoiceOrder && (
      <View style={{ width: "100%" }}>
        <View style={{ height: 150, width: "70%", alignSelf: "center" }}>
          <Image
            style={{
              width: "100%",
              height: "100%",
              alignSelf: "center",
              resizeMode: "contain",
            }}
            source={require("../../assets/icon4.png")}
          />
        </View>
        <View style={{ marginTop: 0 }}>
          <View>
            <Text style={{ fontSize: 70, textAlign: "center" }}>
              {invoiceOrder.customerDetails.name}
            </Text>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={{ fontSize: 45, textAlign: "center" }}>
              {invoiceOrder.customerDetails.phone}
            </Text>
          </View>
          <View
            style={{
              marginTop: 5,
              borderWidth: 5,
              borderRadius: 30,
              padding: 5,
            }}
          >
            <Text style={{ fontSize: 45, textAlign: "center" }}>
              {invoiceOrder.order.receipt_method}
            </Text>
          </View>
          <View
            style={{
              marginTop: 10,
              borderWidth: 5,
              padding: 5,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            {/* <Text style={{ fontSize: 90, textAlign: "center" }}>
              {i18n.t(moment(invoiceOrder.orderDate).format("dddd"))}
            </Text> */}
            <Text style={{ fontSize: 90, textAlign: "center" }}>
              {moment(invoiceOrder.orderDate).format("HH:mm")}
            </Text>
          </View>
        </View>
        {/* 
        <View
          style={{
            marginTop: 10,
            borderWidth: 5,
            padding: 5,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 90, textAlign: "center" }}>
            {moment(invoiceOrder.orderDate).format("DD/MM")}
          </Text>
        </View> */}
        {invoiceOrder.order?.payment_method &&
          invoiceOrder?.ccPaymentRefData?.data?.StatusCode == 1 && (
            <View
              style={{
                marginTop: 10,
                borderWidth: 5,
                padding: 5,
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 90, textAlign: "center" }}>
                بطاقة - مدفوع
              </Text>
            </View>
          )}

        <View style={{ borderWidth: 5, marginTop: 15, padding: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 45, textAlign: "center" }}>
                {i18n.t("order-number")}
              </Text>
            </View>
            <View style={{}}>
              <Text style={{ fontSize: 45, textAlign: "center" }}>
                {getOrderId(invoiceOrder.orderId)}
              </Text>
            </View>
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopWidth: 1,
              paddingTop: 10,
              marginTop: 10,
            }}
          >
            <View>
              <Text style={{ fontSize: 45, textAlign: "left" }}>
                {i18n.t("order-sent-date")}
              </Text>
            </View>
            <View style={{}}>
              <Text style={{ fontSize: 45, textAlign: "center" }}>
                {moment(invoiceOrder.created).format("HH:mm DD/MM")}
              </Text>
            </View>
          </View> */}

          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopWidth: 1,

              paddingTop: 10,
              marginTop: 10,
            }}
          >
            <View>
              <Text style={{ fontSize: 45, textAlign: "left" }}>
                {i18n.t("collect-date")}
              </Text>
            </View>
            <View style={{}}>
              <Text style={{ fontSize: 45, textAlign: "center" }}>
                {moment(invoiceOrder.orderDate).format("HH:mm DD/MM")}
              </Text>
            </View>
          </View> */}
        </View>

        <View style={{ borderWidth: 5, marginTop: 15, padding: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 45, textAlign: "center" }}>
                {i18n.t("pizza-count")}
              </Text>
            </View>
            <View style={{}}>
              <Text style={{ fontSize: 45, textAlign: "center" }}>
                {getPizzaCount(invoiceOrder?.order?.items)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <InvoiceOrderItems orderItems={invoiceOrder.order.items} />
        </View>
        {invoiceOrder?.note && (
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text style={{ fontSize: 45 }}>ملاحظة:</Text>
            </View>
            <View>
              <Text style={{ fontSize: 45 }}> {invoiceOrder.note}</Text>
            </View>
          </View>
        )}
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 5,
            padding: 10,
          }}
        >
          <View>
            <Text style={{ fontSize: 65, textAlign: "left" }}>
              {i18n.t("final-price")}
            </Text>
          </View>
          <View style={{}}>
            <Text style={{ fontSize: 65, textAlign: "center" }}>
              {`₪${getOrderTotalPrice(invoiceOrder)}`}
            </Text>
          </View>
        </View>

        {invoiceOrder?.order?.geo_positioning?.qrURI &&
          !invoiceOrder?.order?.locationText && (
            <View
              style={{
                marginTop: 10,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontSize: 45, textAlign: "left" }}>
                  {i18n.t("scan-barcode")}
                </Text>
              </View>
              <View style={{ marginTop: 0 }}>
                <Image
                  source={{ uri: invoiceOrder?.order?.geo_positioning?.qrURI }}
                  style={{ width: 350, height: 350 }}
                />
              </View>
            </View>
          )}

        {invoiceOrder?.order?.locationText && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 45, textAlign: "left" }}>
                {i18n.t("address")}
              </Text>
            </View>
            <View style={{ marginTop: 0 }}>
              <Text style={{ fontSize: 45, textAlign: "left" }}>
                {invoiceOrder?.order?.locationText}
              </Text>
            </View>
          </View>
        )}

        <View
          style={{
            marginTop: 20,
            height: 50,
            width: "50%",
            alignSelf: "center",
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%",
              alignSelf: "center",
              resizeMode: "contain",
            }}
            source={require("../../assets/copyright-logo.png")}
          />
        </View>
      </View>
    )
  );
};

export default OrderInvoiceCMP;
