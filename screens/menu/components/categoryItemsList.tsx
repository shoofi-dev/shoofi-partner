import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Animated,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../stores";
import i18n from "../../../translations/index-x";
import { ScrollView } from "react-native-gesture-handler";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import { getCurrentLang } from "../../../translations/i18n";
import * as Haptics from "expo-haptics";
import Button from "../../../components/controls/button/button";
import { ROLES, cdnUrl, devicesType } from "../../../consts/shared";
import ProductItem from "./product-item/index";
import ProductCarousleItem from "./product-item/carousle";
import AddProductItem from "./product-item/add";
import Carousel from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import BirthdayCakes from "./product-item/birthday-cakes";
import ConfirmActiondDialog from "../../../components/dialogs/confirm-action";
import _useDeviceType from "../../../hooks/use-device-type";
import { keys } from "mobx";

const CategoryItemsList = ({ productsList, category }) => {
  const navigation = useNavigation();
  const scrollRef = useRef();
  const { deviceType } = _useDeviceType();

  const { userDetailsStore, menuStore, languageStore } =
    useContext(StoreContext);
  const [selectedItem, setSelectedItem] = useState();
  const [selectedSubCategory, setSelectedSubCategory] = useState("1");
  const [tmpSelectedCategory, setTmpSelectedCategory] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [tmpSelectedCategoryProg, setTmpSelectedCategoryProg] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [isProductAnimateDone, setIsProductAnimateDone] = useState(true);

  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] =
    useState(false);
  const onItemSelect = (item) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedItem(item);
    navigation.navigate("meal", { product: item, category });
  };
  const onAddProduct = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate("admin-add-product", { categoryId: category._id });
  };

  const handleConfirmActionAnswer = (answer: string) => {
    if (answer) {
      menuStore.deleteProduct([selectedItem._id]).then((res: any) => {
        menuStore.getMenu();
        navigation.navigate("menu");
      });
    }
    setIsOpenConfirmActiondDialog(false);
  };

  const onDeleteProduct = (item: any) => {
    //setIsLoading(true);
    setSelectedItem(item);
    setIsOpenConfirmActiondDialog(true);
  };
  const onEditProduct = (item: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate("admin-add-product", { product: item });
  };

  const handleSubCategoryChange = (vlaue: string) => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
    setPageNumber(1);

    setSelectedSubCategory(vlaue);
    setTmpSelectedCategory(undefined);
  };

  useEffect(() => {
    if (selectedCats.indexOf(selectedSubCategory) > -1) {
      setTmpSelectedCategoryProg(false);
      setTmpSelectedCategory(selectedSubCategory);
      return;
    }
    setPageNumber(1);
    setTimeout(() => {
      setTmpSelectedCategoryProg(false);

      setTmpSelectedCategory(selectedSubCategory);
      setSelectedCats([...selectedCats, selectedSubCategory]);
    }, 0);
  }, [selectedSubCategory]);

  const filterBirthday = () => {
    const items = productsList.filter(
      (item) => item.subCategoryId === selectedSubCategory
    );
    return productsList;
  };

  const onScrollEnd = ({ nativeEvent }) => {
    const paddingToBottom = 800;
    const isReachedBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - paddingToBottom;
    if (isReachedBottom) {
      setIsLoadingProducts(true);
      setPageNumber(pageNumber + 1);
    }
  };

  const onMomentumScrollEndAction = ({ nativeEvent }) => {
    const paddingToBottom = 10;
    const isReachedBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - paddingToBottom;
    if (isReachedBottom) {
      console.log(
        "yy111",
        nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y
      );

      setIsLoadingProducts(true);
      setPageNumber(pageNumber + 1);
      setTimeout(() => {
        console.log(
          "yy",
          nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y
        );
        scrollRef.current?.scrollTo({
          y:
            nativeEvent.layoutMeasurement.height +
            nativeEvent.contentOffset.y -
            100,
          animated: true,
        });
      }, 0);
    }
  };

  const productsAnim = useRef(new Animated.Value(1000));
  const productsAnimate = () => {
    Animated.timing(productsAnim.current, {
      toValue: 15,
      duration: 1000,
      useNativeDriver: false,
      delay: 200,
    }).start(() => {
      setTimeout(() => {
        setIsProductAnimateDone(true);
      }, 1000);
    });
  };

  useEffect(() => {
    productsAnimate();
  }, []);

  const filterBirthdayProducts = filterBirthday();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', position: 'relative' }}>
      <FlatList
        data={filterBirthdayProducts.slice(0, pageNumber * 5)}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ProductItem
            item={item}
            onItemSelect={onItemSelect}
            onDeleteProduct={onDeleteProduct}
            onEditProduct={onEditProduct}
          />
        )}
        onEndReached={() => {
          if (filterBirthdayProducts.length >= pageNumber * 5) {
            setIsLoadingProducts(true);
            setPageNumber(pageNumber + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          filterBirthdayProducts.length >= pageNumber * 5 ? (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />



      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={"sure-continue"}
        positiveText="agree"
        negativeText="cancel"
      />
    </View>
  );
};
export default observer(CategoryItemsList);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    maxWidth: 600,
    justifyContent: "space-between",
    alignSelf: "center",
    width:"100%",
    paddingHorizontal:5,
    alignItems:'center',
    marginBottom:40
  },
  categoryItem: {
    marginBottom: 15,
    height: 360,
    justifyContent: "center",
    borderRadius: 0,
    backgroundColor: "#F8F6F4",
    paddingVertical: 60,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  square: {
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 4,
    height: 150,
    shadowColor: "black",
    width: 150,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

// <TouchableOpacity onPress={()=>onItemSelect(productsList[index])} style={{ height: "70%", width: "100%", borderRadius:30, overflow:"hidden", }}>
//  <View style={{position:"absolute",zIndex:1, top: "50%", marginLeft:5, borderRadius:30, width:60, height:60, justifyContent:"center",alignItems:"center"}}>
//   <LinearGradient
//         colors={[
//           "rgba(207, 207, 207, 0.8)",
//           "rgba(232, 232, 230, 0.8)",
//           "rgba(232, 232, 230, 0.8)",
//           "rgba(232, 232, 230, 0.8)",
//           "rgba(207, 207, 207, 0.8)",
//         ]}
//         start={{ x: 1, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[styles.background,{borderRadius:30}]}
//       />
//   <Text style={{ textAlign: "center", fontSize: 40 }}>></Text>
//   </View>
//   <View style={{position:"absolute",zIndex:1, top: "50%", right: 10, borderRadius:30, width:60, height:60, justifyContent:"center",alignItems:"center"}}>
//   <LinearGradient
//         colors={[
//           "rgba(207, 207, 207, 0.8)",
//           "rgba(232, 232, 230, 0.8)",
//           "rgba(232, 232, 230, 0.8)",
//           "rgba(232, 232, 230, 0.8)",
//           "rgba(207, 207, 207, 0.8)",
//         ]}
//         start={{ x: 1, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[styles.background,{borderRadius:30}]}
//       />
//   <Text style={{ textAlign: "center", fontSize: 40 }}>{`<`}</Text>
//   </View>

//    <ImageBackground
//     source={{ uri: `${cdnUrl}${productsList[index].img[0].uri}` }}
//     style={{ height: "100%", width: "100%", borderRadius:30  }}
//   >
//     <View style={{ position: "relative", borderRadius:30, marginTop:10  }}>
//       <LinearGradient
//         colors={[
//           "rgba(207, 207, 207, 0.4)",
//           "rgba(232, 232, 230, 0.4)",
//           "rgba(232, 232, 230, 0.4)",
//           "rgba(232, 232, 230, 0.4)",
//           "rgba(207, 207, 207, 0.4)",
//         ]}
//         start={{ x: 1, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[styles.background]}
//       />
//       <Text style={{ textAlign: "center", fontSize: 25 }}>
//         {languageStore.selectedLang === "ar"
//           ? productsList[index].nameAR
//           : productsList[index].nameHE}
//       </Text>
//       <Text style={{ textAlign: "center", fontSize: 25 }}>
//       ₪{
//           getPriceBySize(productsList[index]) || productsList[index].price
//           }
//       </Text>
//     </View>
//   </ImageBackground>
// </TouchableOpacity>
