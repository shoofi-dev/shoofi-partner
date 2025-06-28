import { observer } from "mobx-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { StoreContext } from "../../../../stores";
import CheckBox from "../../../../components/controls/checkbox";
import { ScrollView } from "react-native-gesture-handler";
import themeStyle from "../../../../styles/theme.style";
import { cdnUrl } from "../../../../consts/shared";
import Text from "../../../../components/controls/Text";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import CustomFastImage from "../../../../components/custom-fast-image";
import Button from "../../../../components/controls/button/button";
const ProductsOrderList = ({
  products,
  categoryId,
  subCategoryId,
  onLoadingChange,
  onProductsUpdate,
  onReachedBottom,
}) => {
  const { t } = useTranslation();
  const { languageStore, menuStore } = useContext(StoreContext);
  const [productsList, setProductsList] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProductsList(products);
  }, [products]);

  const onOrderAction = async (orderedProducts) => {
    setIsLoading(true);
    setProductsList(orderedProducts);
    onProductsUpdate(orderedProducts);
    await menuStore.updateProductsOrder({
      productsList: orderedProducts,
      categoryId,
      subCategoryId: categoryId == 5 ? subCategoryId : null,
    });
    await menuStore.getMenu();
    setIsLoading(false);
  };

  // const onSaveChanges = async () => {
  //    onLoadingChange(true);
  //   await menuStore.updateProductsOrder({productsList, categoryId, subCategoryId: categoryId == 5 ? subCategoryId : null});
  //   await menuStore.getMenu();
  //    onLoadingChange(false);
  // };

  const onScrollEnd = ({ nativeEvent }) => {
    const paddingToBottom = 800;
    const isReachedBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - paddingToBottom;
    if (isReachedBottom) {
      onReachedBottom();
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <View style={{}}>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            {
              borderWidth: 1,
              borderColor: themeStyle.PRIMARY_COLOR,
              backgroundColor: isActive
                ? themeStyle.SUCCESS_COLOR
                : "transparent",
            },
          ]}
          key={item._id}
        >
          <View style={{ right: 30 }}>
            <CustomFastImage
              style={{
                height: 150,
                width: 100,
              }}
              source={{ uri: `${cdnUrl}${item?.img[0]?.uri}` }}
              cacheKey={`${item?.img[0]?.uri?.split(/[\\/]/).pop()}`}
              resizeMode={item.subCategoryId == "2" ? "stretch" : null}
            />
          </View>
          <View>
            <Text
              style={{
                textAlign: "left",
                fontSize: 24,
                color: isActive
                  ? themeStyle.WHITE_COLOR
                  : themeStyle.TEXT_PRIMARY_COLOR,
              }}
            >
              {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (!productsList) {
    return null;
  }
  return (
    <View style={{ flexDirection: "row" }}>
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
            zIndex: 10,
            backgroundColor: "rgba(232, 232, 230, 0.8)",
          }}
        >
          <View style={{ alignSelf: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      )}
      <View style={{ marginHorizontal: 20, marginTop: 20 }}>
        <View
          style={{
            width: "100%",
            alignSelf: "center",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height:"85%"
          }}
        >
          <DraggableFlatList
            data={productsList}
            onDragEnd={({ data }) => onOrderAction(data)}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            scrollEnabled
            onMomentumScrollEnd={onScrollEnd}
            onScrollEndDrag={onScrollEnd}
            onMomentumScrollBegin={onScrollEnd}
          />
        </View>
      </View>
    </View>
  );
};
export default observer(ProductsOrderList);

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
  rowItem: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
    alignSelf: "center",
    width: 550,
    height: 155,
    paddingHorizontal: 40,
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});
