import { StyleSheet, View, Image, Dimensions } from "react-native";
import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import StoresCategoryItem from "./item";
import Carousel from "react-native-reanimated-carousel";
import { ScrollView } from "react-native-gesture-handler";

export type TProps = {
  categoryList: any;
};

const StoresCategoryList = ({ categoryList }: TProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
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
          {categoryList?.map((categoryItem) => {
            return (
              <View style={{ height: 180, marginBottom: 20, flexBasis: "45%" }}>
                <StoresCategoryItem categoryItem={categoryItem} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
export default observer(StoresCategoryList);

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
