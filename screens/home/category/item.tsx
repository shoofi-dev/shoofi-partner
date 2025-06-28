import { StyleSheet, View, Image } from "react-native";
import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";

export type TProps = {
    storeItem: any;
}

const StoresCategoryItem = ({storeItem}: TProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
        
          <Text>{storeItem.storeName}</Text>
       
    </View>
  );
};
export default observer(StoresCategoryItem);

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
