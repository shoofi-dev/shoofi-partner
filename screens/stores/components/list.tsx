import { StyleSheet, View, Image, Dimensions, ScrollView } from "react-native";
import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import StoresCategoryItem from "./item";
import Carousel from "react-native-reanimated-carousel";

export type TProps = {
  storesList: any;
};

const StoresList = ({ storesList }: TProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={{ alignItems:'center', marginHorizontal:20, marginBottom:20}}>
      <Text style={{fontWeight:'900', fontSize:25}}>
        {t('רשימת החנויות')}
        </Text>
      </View>
      <ScrollView>
        <View
          style={{
            flex: 1,
            flexWrap: "wrap",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          {storesList?.map((storeItem) => {
            return (
              <View style={{ height: 180, marginBottom: 20, flexBasis: "45%" }}>
                <StoresCategoryItem storeItem={storeItem} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
export default observer(StoresList);

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%" },
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
