import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
} from "react-native";
import { useContext, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import themeStyle from "../../../styles/theme.style";
import CustomFastImage from "../../../components/custom-fast-image";
import { StoreContext } from "../../../stores";
import { useNavigation } from "@react-navigation/native";
import { cdnUrl } from "../../../consts/shared";
import Icon from "../../../components/icon";

export type TProps = {
  storeItem: any;
};

const StoreItem = ({ storeItem }: TProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  let { menuStore, storeDataStore, shoofiAdminStore, languageStore } =
    useContext(StoreContext);
  const onStoreSelect = async (store: any) => {
    try {
      // setIsLoading(true);
      // Clear the menu cache first to prevent showing old store data
      menuStore.clearMenu();
      await shoofiAdminStore.setStoreDBName(store.appName);
      // await menuStore.getMenu();
      // await storeDataStore.getStoreData();
      (navigation as any).navigate("menuScreen", { fromStoresList: Date.now() });
    } catch (error) {
      console.error("Error loading store:", error);
      // You could show an error message here
    }
  };
  // Placeholder values for demo
  const isNew = storeItem.store.isNew || false;
  const rating = storeItem.store.rating || 4.1;
  const distance = storeItem.store.distance || 1.6;
  const deliveryTime = storeItem.store.deliveryTime || 27;
  const location = storeItem.store.location || "כפר קאסם";
  const deliveryPrice = storeItem.deliveryPrice || 10;
  const isOpen = storeItem.store.isOpen !== false; // true by default
  const logoUri = storeItem.store.storeLogo?.uri;
  const imageUri =
    (storeItem.store?.cover_sliders &&
      storeItem.store.cover_sliders.length > 0 &&
      storeItem.store?.cover_sliders[0]?.uri) ||
    logoUri;
  const storeName = languageStore.selectedLang === "ar" ? storeItem.store.name_ar : storeItem.store.name_he;
  if (
    storeItem.store.cover_sliders &&
    storeItem.store.cover_sliders.length > 0
  ) {
  }
  
  return (
    <TouchableOpacity
      onPress={() => onStoreSelect(storeItem.store)}
      style={styles.card}
      activeOpacity={0.9}
      disabled={isLoading}
    >
      {/* Store Image */}
      <View style={styles.imageWrapper}>
        <CustomFastImage
          style={styles.image}
          source={{ uri: `${cdnUrl}${storeItem?.store?.cover_sliders?.[0]?.uri}` }}
          resizeMode="cover"
        />
        
        {/* Loading overlay */}
        {/* {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
            <Text style={styles.loadingText}>{t("loading")}</Text>
          </View>
        )} */}
      </View>
      {logoUri && (
        <View style={styles.logoOverlay}>
          <CustomFastImage
            style={styles.logo}
            source={{ uri: `${cdnUrl}${logoUri}` }}
            resizeMode="contain"
          />
        </View>
      )}
      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.storeName}>{storeName}</Text>
        </View>
        <View style={styles.infoRow}>
          {/* <View>
            <Text style={styles.infoText}>{rating} <Icon icon="star" size={16}  color={themeStyle.GRAY_70}  /></Text>
          </View> */}
          <View>
            <Text style={styles.infoText}>{distance} {t("km")}</Text>
          </View>
          <View style={{marginRight: 5, marginLeft: 5}}>
            <Text style={styles.openStatus}>
              {isOpen ? t("open") : t("closed")}
            </Text>
          </View>
        </View>
    
        {storeItem.store.description && <Text style={styles.descText} >
         {storeItem.store.description}
        </Text>}
      </View>
    </TouchableOpacity>
  );
};
export default observer(StoreItem);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
    marginTop: 8,
    marginHorizontal: 0,
    width: "95%",
    alignSelf: "center",
  },
  imageWrapper: {
    width: "100%",
    height: 216,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoOverlay: {
    position: "absolute",
    top: 170,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_30,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    resizeMode: "cover",
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 14,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  storeName: {
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "700",
    color: themeStyle.GRAY_700,
    textAlign: "right",
    flexShrink: 1,
    flex: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: themeStyle.GRAY_700,
    opacity: 0.8,
    textAlign: "left",
  },
  openStatus: {
    color: "#2ecc40",
    fontWeight: "bold",
    marginLeft: 5,
  },
  descText: {
    fontSize: 13,
    color: themeStyle.GRAY_700,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "left",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeStyle.PRIMARY_COLOR,
  },
});
