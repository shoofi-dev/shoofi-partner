import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import CustomFastImage from "../../../components/custom-fast-image";
import themeStyle from "../../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";

export type TProps = {
  categoryItem: any;
};

const StoresCategoryItem = ({ categoryItem }: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const onCategeroySelect = (categoryId: string) => {
    navigation.navigate("stores-screen", { categoryId: categoryId });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onCategeroySelect(categoryItem.categoryId)}
        style={{
          width: "100%",
        }}
      >
        <View
          style={{
            shadowColor: themeStyle.SHADOW_COLOR,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.9,
            shadowRadius: 6,
            elevation: 20,
            borderWidth: 0,
            backgroundColor: "transparent",

            width: "100%",
          }}
        >
          <CustomFastImage
            style={{
              width: "100%",
              height: 150,
              borderRadius: 30,
            }}
            source={{ uri: `${categoryItem.image}` }}
            cacheKey={`${categoryItem.image.split(/[\\/]/).pop()}1`}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {categoryItem.name}
          </Text>
        </View>
      </TouchableOpacity>
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
