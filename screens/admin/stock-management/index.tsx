import { observer } from "mobx-react";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StoreContext } from "../../../stores";
import useWebSocket from "react-use-websocket";
import StockProductsList from "./products-list";
import DashedLine from "react-native-dashed-line";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import _useWebSocketUrl from "../../../hooks/use-web-socket-url";

const categoriesToShow = [1, 2, 3, 4, 5, 6, 7];

const StockManagementScreen = ({ route }) => {
  const { t } = useTranslation();
  const [categoryList, setCategoryList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { menuStore, languageStore, userDetailsStore } =
    useContext(StoreContext);

  useEffect(() => {}, [languageStore]);

  const getMenu = () => {
    const categories = menuStore.categories;
    setCategoryList(categories);
  };

  const { webScoketURL } = _useWebSocketUrl();

  const { lastJsonMessage } = useWebSocket(webScoketURL, {
    share: true,
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      menuStore.getMenu().then(() => {
        getMenu();
      });
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    getMenu();
  }, [menuStore.categories]);

  const onLoadingChange = (value) => {
    if(value){
      setIsLoading(value);
    }else{
        setIsLoading(value);
  
    }
  };

  if (!categoryList) {
    return null;
  }
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          marginTop: 10,
          fontSize: 30,
          textAlign: "center",
          borderWidth: 1,
          padding: 10,
          color: themeStyle.WHITE_COLOR,
          borderColor: themeStyle.WHITE_COLOR
        }}
      >
        {t("ادارة المخزون")}
      </Text>

      {isLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                alignItems: "center",
                justifyContent: "center",
                zIndex:10,
                backgroundColor: "rgba(232, 232, 230, 0.1)",

              }}
            >
              <View style={{alignSelf:'center'}}>
              <ActivityIndicator size="large" />

                </View>
            </View>
          )}
      <ScrollView horizontal={true} style={{ marginTop: 25 }}>
        <View
          style={{
            flex: 1,
            flexWrap: "wrap",
            flexDirection: "row",
          }}
        >
  
          {categoryList.map((category, index) => {
            if (categoriesToShow.indexOf(category.categoryId) > -1)
              return (
                <View
                  style={{
                    borderRightWidth: 1,
                    borderRightColor: "rgba(199, 199, 199, 0.9)",
                    height: "100%",
                  }}
                  key={category._id}
                >
                  <View style={{}}>
                    <StockProductsList
                      products={category.products}
                      category={category}
                      onLoadingChange={onLoadingChange}
                    />
                  </View>
                </View>
              );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
export default observer(StockManagementScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    marginTop: 30,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
});
