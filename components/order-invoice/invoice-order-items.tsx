import { Animated, Image, SafeAreaView, Text, View } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import i18n, { getCurrentLang } from "../../translations/i18n";
import DashedLine from "react-native-dashed-line";
import isShowSize from "../../helpers/is-show-size";
import sortPizzaExtras from "../../helpers/sort-pizza-extras";
import { StoreContext } from "../../stores";
import InvoiceOrderExtrasDisplay from "../shared/InvoiceOrderExtrasDisplay";

const InvoiceOrderItems = ({ orderItems }) => {
  const { menuStore } = useContext(StoreContext);

  const getExtrasDefForItem = (item_id) => {
    const product = menuStore.products.find(p => p._id === item_id || p.item_id === item_id);
    return product ? product.extras : [];
  };
  return (
    <View style={{ width: "100%", paddingBottom: 15 }}>
      {/* <DashedLine
        dashLength={10}
        dashThickness={5}
        dashGap={0}
        style={{ marginBottom: 15 }}
      /> */}
      {orderItems.map((order, index) => {
              const extrasMeal = menuStore.getFromCategoriesMealByKey(order.item_id);
        return (
          <View style={{marginTop:20, borderWidth:5}}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flexBasis: "75%", flexDirection: "row", }}>
              <Text style={{ fontSize: 45, textAlign: "left" }}>
                  {`X${order.qty}`}
                </Text>
                <View style={{ width:20 }}></View>
                <Text style={{ fontSize: 45, textAlign: "left" }} ellipsizeMode="tail" numberOfLines={1}>
                  {
                    `${
                      getCurrentLang() === "ar" ? order.nameAR : order.nameHE
                    }`}
                </Text>
            
              </View>

              <View>
                <Text style={{ fontSize: 45, textAlign: "left" }}>
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



              </View>
              </View>
              <View>
              <InvoiceOrderExtrasDisplay
            extrasDef={extrasMeal.extras}
            selectedExtras={order.selectedExtras}
            fontSize={size => size} // or your font size function
          />
              </View>






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
                      {"ملاحظة"}:
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
