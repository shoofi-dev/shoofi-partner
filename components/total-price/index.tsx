import { View, StyleSheet } from "react-native";
import Text from "../controls/Text";
import Icon from "../icon";
import themeStyle from "../../styles/theme.style";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { SHIPPING_METHODS } from "../../consts/shared";
import { StoreContext } from "../../stores";
import { useContext, useEffect, useState } from "react";
import { getCurrentLang } from "../../translations/i18n";
import { useAvailableDrivers } from "../../hooks/useAvailableDrivers";
import CouponInput from "../coupon/CouponInput";

export type TProps = {
  onChangeTotalPrice: any;
  hideCouponInput?: boolean;
};
export default function TotalPriceCMP({
  onChangeTotalPrice,
  hideCouponInput = false,
}: TProps) {
  const { t } = useTranslation();
  const { cartStore } = useContext(StoreContext);

  const [shippingMethod, setShippingMethod] = useState(null);

  useEffect(() => {
    cartStore.getShippingMethod().then((shippingMethodTmp) => {
      setShippingMethod(shippingMethodTmp);
    });
  }, [cartStore]);

  const {
    availableDrivers,
    loading: driversLoading,
    error: driversError,
  } = useAvailableDrivers({
    isEnabled: shippingMethod === SHIPPING_METHODS.shipping,
  });
  const [itemsPrice, setItemsPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const areaDeliveryPrice = availableDrivers?.area?.price;

  useEffect(() => {
    getItemsPrice();
  }, [cartStore.cartItems]);

  useEffect(() => {
    const deliveryPriceTmp =
      shippingMethod === SHIPPING_METHODS.shipping
        ? areaDeliveryPrice || 0
        : null;
    setDeliveryPrice(deliveryPriceTmp);
  }, [availableDrivers, shippingMethod]);

  useEffect(() => {
    getTotalPrice();
  }, [
    itemsPrice,
    shippingMethod,
    availableDrivers?.area?.price,
    availableDrivers,
    driversLoading,
    discount,
    deliveryPrice,
  ]);

  const getTotalPrice = () => {
    const totalPriceTmp = itemsPrice + deliveryPrice - discount;
    setTotalPrice(totalPriceTmp);
    onChangeTotalPrice(totalPriceTmp);
  };

  const getItemsPrice = () => {
    let tmpOrderPrice = 0;
    cartStore.cartItems.forEach((item) => {
      if (item) {
        tmpOrderPrice += item.data.price * item.others.qty;
      }
    });
    setItemsPrice(tmpOrderPrice);
  };

  const rows = [{ label: t("order-price"), value: itemsPrice }];
  if (deliveryPrice !== null) {
    rows.push({ label: t("delivery"), value: deliveryPrice });
  }
  if (discount) {
    rows.push({ label: t("discount"), value: discount });
  }

  const renderCouponInput = () => {
    if (hideCouponInput) return null;

    return (
      <CouponInput
        orderAmount={totalPrice}
        userId="current-user-id"
        onCouponApplied={(couponApp) => {
          console.log("couponApp", couponApp);
          setDiscount(couponApp.discountAmount);
          console.log("Coupon applied:", couponApp);
        }}
        onCouponRemoved={() => {
          console.log("Coupon removed");
          setDiscount(0);
        }}
      />
    );
  };

  const renderRows = () => {
    return rows.map((row, idx) => (
      <>
        <View
          key={row.label}
          style={[styles.row, idx === rows.length - 1 ? styles.lastRow : null]}
        >
          <Text style={styles.price} type="number">
            ₪{row.value.toFixed(2)}
          </Text>
          <Text style={styles.label}>{row.label}</Text>
        </View>
        <View
          style={{
            height: 1,
            width: "100%",
            backgroundColor: themeStyle.GRAY_20,
          }}
        ></View>
      </>
    ));
  };

  return (
    <View style={styles.totalPriceContainer}>
      {/* {renderCouponInput()} */}
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#E5E7EB",
        }}
      ></View>
      {renderRows()}
      <View style={[styles.row, styles.lastRow, { marginTop: 8 }]}>
        <Text style={styles.priceTotal} type="number">
          ₪{totalPrice.toFixed(2)}
        </Text>
        <Text style={styles.labelTotal}>{t("final-price-short")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  totalPriceContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  price: {
    color: themeStyle.GRAY_60,
    fontSize: themeStyle.FONT_SIZE_SM,
    minWidth: 70,
    textAlign: "left",
  },
  label: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "right",
    flex: 1,
  },
  priceTotal: {
    color: themeStyle.GRAY_60,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_SM,
    minWidth: 70,
    textAlign: "left",
  },
  labelTotal: {
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "right",
    flex: 1,
  },
});
