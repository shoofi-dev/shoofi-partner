import { Animated, Image, SafeAreaView, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import i18n, { getCurrentLang } from "../../translations/i18n";
import DashedLine from "react-native-dashed-line";
import isShowSize from "../../helpers/is-show-size";
import sortPizzaExtras from "../../helpers/sort-pizza-extras";

const InvoiceOrderItems = ({ orderItems }) => {
  return (
    <View style={{ width: "100%", paddingBottom: 15 }}>
      {/* <DashedLine
        dashLength={10}
        dashThickness={5}
        dashGap={0}
        style={{ marginBottom: 15 }}
      /> */}
      {orderItems.map((order, index) => {
        const extrasSorted = sortPizzaExtras(order?.halfOne ? [...order?.halfOne] : undefined, order?.halfTwo ? [...order?.halfTwo] : undefined);
        return (
          <View style={{marginTop:20, borderWidth:5}}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flexBasis: "30%" }}>
                <Text style={{ fontSize: 65, textAlign: "left" }}>
                  {`X${order.qty} ` +
                    `${
                      getCurrentLang() === "ar" ? order.nameAR : order.nameHE
                    }`}
                </Text>
              </View>
              {isShowSize(order.item_id) &&   <View
                style={{
                  flexBasis: "50%",
                  flexDirection:'row'
                }}
              >
                <View>
                  <Text style={{ fontSize: 65, textAlign: "left" }}>
                    {i18n.t("size")}:
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 65, textAlign: "left" }}>
                    {i18n.t(order.size)}
                  </Text>
                </View>
              </View>}
              <View>
                <Text style={{ fontSize: 65, textAlign: "left" }}>
                  {`₪${order.price * order.qty}`}
                </Text>
              </View>
            </View>

            <View style={{ marginHorizontal: 8, marginTop:10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 15,
                }}
              >
                <View style={{ flexBasis: "48%" }}>
                  {order?.halfOne && (
                    <View
                      style={{
                        borderBottomWidth: 5,
                        borderTopWidth: 5,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 65,
                          fontFamily: `${getCurrentLang()}-SemiBold`,
                        }}
                      >
                        {i18n.t("halfOne")}
                      </Text>
                    </View>
                  )}

                  {order?.halfOne?.length > 0
                    ? (extrasSorted?.halfOne).map((key, index) => {
                        return (
                          <View>
                            <View style={{ flexDirection: "row" }}>
                              <Text
                                style={{
                                  textAlign: "left",
                                  fontSize: 65,
                                  marginTop: 10,
                                }}
                              >
                                {`${Number(index) + 1}`}
                              </Text>
                              <Text
                                style={{
                                  textAlign: "left",
                                  fontSize: 65,
                                  marginTop: 10,
                                }}
                              >
                                {" "}
                                - {i18n.t(key)}
                              </Text>
                            </View>
                          </View>
                        );
                      })
                    : order?.halfOne && (
                        <Text
                          style={{
                            textAlign: "left",
                            fontSize: 65,
                            marginTop: 10,
                          }}
                        >
                          من غير اضافات
                        </Text>
                      )}
                </View>

                <View style={{ flexBasis: "48%" }}>
                  {order?.halfTwo && (
                    <View
                      style={{
                        borderBottomWidth: 5,
                        borderTopWidth: 5,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 65,
                          fontFamily: `${getCurrentLang()}-SemiBold`,
                        }}
                      >
                        {i18n.t("halfTwo")}
                      </Text>
                    </View>
                  )}
                  {order?.halfTwo?.length > 0
                    ? (extrasSorted?.halfTwo).map((key, index) => {
                        return (
                          <View>
                            <View style={{ flexDirection: "row" }}>
                              <Text
                                style={{
                                  textAlign: "left",
                                  fontSize: 65,
                                  marginTop: 10,
                                }}
                              >
                                {`${Number(index) + 1}`}
                              </Text>
                              <Text
                                style={{
                                  textAlign: "left",
                                  fontSize: 65,
                                  marginTop: 10,
                                }}
                              >
                                {" "}
                                - {i18n.t(key)}
                              </Text>
                            </View>
                          </View>
                        );
                      })
                    : order?.halfOne && (
                        <Text
                          style={{
                            textAlign: "left",
                            fontSize: 65,
                            marginTop: 10,
                          }}
                        >
                          من غير اضافات
                        </Text>
                      )}
                </View>
              </View>
              {/* {isShowSize(order.item_id) &&   <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop:10
                }}
              >
                <View>
                  <Text style={{ fontSize: 65, textAlign: "left" }}>
                    {i18n.t("size")}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 65, textAlign: "left" }}>
                    {i18n.t(order.size)}
                  </Text>
                </View>
              </View>} */}
              {order.toName && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {i18n.t("name")}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {i18n.t(order.toName)}
                    </Text>
                  </View>
                </View>
              )}

              {order.toAge && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {i18n.t("age")}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {i18n.t(order.toAge)}
                    </Text>
                  </View>
                </View>
              )}

              {order.onTop && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {i18n.t("extraOnTop")}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {i18n.t(order.onTop)}
                    </Text>
                  </View>
                </View>
              )}

              {(order.clienImage || order.suggestedImage) && (
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      + {i18n.t("image")}
                    </Text>
                  </View>
                </View>
              )}

              {order.note && (
                <View
                  style={{
                    // flexDirection: "row",
                    // justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  <View style={{}}>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {"مواصفات الكعكة"}:
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 65, textAlign: "left" }}>
                      {order.note}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            {/* {orderItems?.length - 1 != index && (
              <DashedLine
                dashLength={10}
                dashThickness={5}
                dashGap={10}
                style={{ marginVertical: 15 }}
              />
            )} */}
          </View>
        );
      })}
      {/* <DashedLine
        dashLength={10}
        dashThickness={5}
        dashGap={0}
        style={{ marginTop: 15 }}
      /> */}
    </View>
  );
};

export default InvoiceOrderItems;
