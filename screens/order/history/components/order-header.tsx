import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native"
import themeStyle from "../../../../styles/theme.style";
import Text from "../../../../components/controls/Text";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";
import moment from "moment";

const OrderHeader = ({ order }) => {
    const { t } = useTranslation();

    const renderOrderDateRaw = (order) => {
        const orderIdSplit = order.orderId.split("-");
        const idPart1 = orderIdSplit[0];
        const idPart2 = orderIdSplit[2];
        return (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
              flexWrap: "wrap",
              // marginTop: 25,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <View>
                <Text style={styles.dateRawText}>{t("order-number")}:</Text>
                <Text style={styles.dateRawText}>{order?.appName}</Text>

              </View>
              <View>
                <Text style={styles.dateRawText}>
                  {idPart1}-{idPart2}{" "}
                </Text>
              </View>
            </View>
          </View>
        );
      };

    return(
        <View style={{ width:"100%" }}>
        <View
          style={[
            styles.orderContainer,
       
          ]}
        >

 
                    {renderOrderDateRaw(order)}
       </View>
     </View>
    )
}

export default OrderHeader;

const styles = StyleSheet.create({
    orderContainer: {
      padding: 10,
      width: "100%",
      borderRadius: 10,
    },
    textLang: {
      //   fontFamily: props.fontFamily + "Bold",
      fontSize: 25,
      textAlign: "left",
    },
    background: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    dateRawText: {
        fontSize: 16,
      },
  });