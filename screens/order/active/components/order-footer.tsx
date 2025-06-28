import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";
import themeStyle from "../../../../styles/theme.style";
import Text from "../../../../components/controls/Text";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import moment from "moment";
import DashedLine from "react-native-dashed-line";
import CurrentStatus from "../../current-status/current-status";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";

const OrderFooter = ({ order }) => {
  const { t } = useTranslation();
  const { storeDataStore } = useContext(StoreContext);

  const getCollectDate = () =>{
    if(order.orderType){
      return (
        <Text style={styles.dateText}>
        {t(moment(order.orderDate).format("dddd"))}{" - "}
        {moment(order.orderDate).format("DD/MM")}{" - "}
        {moment(order.orderDate).format("HH:mm")}{" "}
        </Text>

      )
    }else{
     return  (<Text style={styles.dateText}>
      {moment(order.orderDate).format("HH:mm")}{" "}
      </Text>)

    }
  }

  const renderOrderTotalRaw = (order) => {
    const oOrder = order.order;
    return (
      <View
        style={{
          borderColor: "#707070",
          marginVertical: 15,
          marginHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
       
        <View
          style={{
            justifyContent: "space-between",
          }}
        >
  
            <View>

            {order.orderDate && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View>
                    <Text style={styles.totalPriceText}>
                      {t("collect-date")}:
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dateText}>
                      {" "}
                      {moment(order.orderDate).isSame(order.datetime) ?
                       t('waiting-for-approve') : getCollectDate()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View>
                  <Text style={styles.totalPriceText}>
                    {t(oOrder.payment_method?.toLowerCase())} |{" "}
                    {t(oOrder.receipt_method?.toLowerCase())}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
              <View>
                <Text style={styles.totalPriceText}>{t("order-price")}:</Text>
              </View>
              <View>
                <Text style={styles.totalPriceText}>₪{order.orderPrice} </Text>
              </View>
            </View>
            </View>
        </View>
      </View>
    );
  };

  return <View style={{ width: "100%" }}>
                 <DashedLine
                  dashLength={5}
                  dashThickness={1}
                  dashGap={0}
                  dashColor={themeStyle.GRAY_300}
                  style={{ marginTop:10}}
                />
    {renderOrderTotalRaw(order)}
    <CurrentStatus order={order}/>
    </View>;
};

export default OrderFooter;

const styles = StyleSheet.create({
  totalPriceText: {
    fontSize: 18,
    marginBottom:10
  },
  dateText: {
    fontSize: 18,

    marginBottom:10,
    color: themeStyle.SUCCESS_COLOR

  },
});
