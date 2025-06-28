import { StyleSheet, View, Image } from "react-native";
import themeStyle from "../../styles/theme.style";
import { useContext, useEffect } from "react";
import { StoreContext } from "../../stores";
import { observer } from "mobx-react";
import { getCurrentLang } from "../../translations/i18n";
import Icon from "../../components/icon";
import BackButton from "../../components/back-button";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Text from "../../components/controls/Text";

const BcoinScreen = () => {
  const { t } = useTranslation();
  const { userDetailsStore, authStore } = useContext(StoreContext);







  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["white", "#F9F9F9", "#FCFCFC", "#FCFCFC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.1 }}
        style={styles.background}
      />
      <View
        style={{
          marginHorizontal: 30,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{zIndex:10}}>
          <BackButton />
        </View>
        <View
          style={{ width: "100%", alignItems: "center", position: "absolute" }}
        >
          <Text
            style={{
              fontSize: 25,
              fontFamily: `${getCurrentLang()}-Bold`,
              color: themeStyle.GRAY_700,
            }}
          >
            B COINS
          </Text>
        </View>
      </View>

      <View style={styles.subContainer}>
        <View
          style={{
            marginTop: 5,
            padding: 9,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon icon="coin" size={80} />
          <Text
            style={{
              position: "absolute",
              fontSize: 35,
              fontWeight: "bold",
            }}
          >
            {userDetailsStore.userDetails?.credit}
          </Text>
        </View>
        <View style={{ marginTop: 5, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 25,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.GRAY_700,
            }}
          >
            {t("you-own-now")} {userDetailsStore.userDetails?.credit}{" "}
            {t("B-COINS")}
          </Text>
          <Text style={{marginTop :15, fontSize:20, textAlign: "center"}}>
            {t('bcoin-note')}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default observer(BcoinScreen);

const styles = StyleSheet.create({
  container: {},
  subContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
