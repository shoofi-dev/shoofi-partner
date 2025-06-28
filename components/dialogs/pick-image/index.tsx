import {
  View,
  Image,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Platform,
} from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

/* styles */
import theme from "../../../styles/theme.style";
import { useState, useEffect, useContext } from "react";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import Icon from "../../icon";
import { LinearGradient } from "expo-linear-gradient";
import { StoreContext } from "../../../stores";
import { cdnUrl } from "../../../consts/shared";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getCurrentLang } from "../../../translations/i18n";
import DialogBG from "../dialog-bg";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  text?: string;
  icon?: any;
};

export default function PickImagedDialog({
  isOpen,
  handleAnswer,
  text,
  icon,
}: TProps) {
  const { t } = useTranslation();
  const { menuStore, storeDataStore } = useContext(StoreContext);

  const [visible, setVisible] = useState(isOpen);
  const [imagesList, setImagesList] = useState();
  const [imageList, setImageList] = useState();
  const [suggestedImage, setSuggestedImage] = useState();

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    menuStore.getImagesByCategory("birthday").then((res) => {
      setImagesList(res);
    });
  }, []);

  const hideDialog = (value: boolean) => {
    handleAnswer && handleAnswer(value);
    setVisible(false);
  };

  const onSuggestedImageSelect = (uri: string) => {
    setSuggestedImage(uri);
    setImageList(null);
  };

  const renderImagesListByType = (type) => {
    const images = imagesList.filter((image) => image.subType === type);
    return (
      <View style={{ alignItems: "flex-start" }}>
        <View>
          <Text style={{ fontSize: 18 }}>
            {type === "1" ? t("for-boys") : t("for-girls")}
          </Text>
        </View>
        <View style={{ marginTop: 5, flexDirection: "row" }}>
          <ScrollView
            style={{ height: "100%", width: "100%" }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((image) => (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => onSuggestedImageSelect(image.data.uri)}
                  style={{
                    // backgroundColor:
                    //   suggestedImage === image.data.uri ? "green" : "transparent",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Image
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      alignSelf: "center",
                      borderWidth: 5,
                      borderColor:
                        suggestedImage === image.data.uri
                          ? themeStyle.SUCCESS_COLOR
                          : "transparent",
                    }}
                    source={{ uri: `${cdnUrl}${image.data.uri}` }}
                  />
                </TouchableOpacity>
                <View style={{ width: 20 }}></View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const onImageSelect = async () => {
    const result = await launchImageLibrary({ mediaType: "photo" });
    setImageList(result.assets[0]);
    // setImageList(result);
    setSuggestedImage(null);
  };
  const handleSaveClick = () => {
    handleAnswer({
      suggestedImage: suggestedImage,
      clientImage: imageList,
    });
  };

  if (!imagesList) {
    return;
  }
  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {},
          }}
          style={{
            borderRadius: 20,

            margin: 0,
            overflow: "hidden",
            top:-20
          }}
          visible={visible}
          dismissable={false}
        >
          <DialogBG>
            <View style={[styles.banner, { alignItems: "center" }]}>
              <LinearGradient
                colors={[
                  "rgba(183, 133, 77, 1)",
                  "rgba(198, 143, 81, 1)",
                  "rgba(215, 156, 86, 1)",
                  "rgba(220, 160, 88, 1)",
                  "rgba(222, 161, 88, 1)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.bannerLinear]}
              />
              <Text
                style={{
                  color: "white",
                  alignItems: "center",
                  fontSize: 20,
                  fontFamily: `${getCurrentLang()}-American-bold`,
                }}
              >
                ₪ {storeDataStore.storeData.image_price}
              </Text>
            </View>

            <Dialog.Content style={{}}>
              <View
                style={{
                  flexDirection: "row",
                  zIndex: 1,
                  paddingBottom: 5,
                  padding: 20,
                  width:"100%"
                }}
              >
                <View
                  style={{
                    flexBasis: "100%",
                    alignSelf: "center",
                    width: "100%",
                    marginTop:-20
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "center",
                      right: -25,
                    }}
                  >
                    {/* <Icon
                    icon="add_image"
                    size={30}
                    style={{ color: theme.GRAY_700 }}
                  /> */}
                    <Text style={{ fontSize: 22 }}>{t("add-image")}</Text>
                  </View>
                  <View
                    style={{ alignItems: "center", marginTop: 5, right: -25 }}
                  >
                    <Text style={{ fontSize: 18, textAlign: "center" }}>
                      {t("add-image-desc")}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: themeStyle.WHITE_COLOR,
                    height: 50,
                    borderRadius: 20,
                    width: 50,
                    right: -35,
                    top: Platform.OS === "ios" ? -60 : -45,
                    zIndex: 30,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      hideDialog(false);
                    }}
                    style={{
                      zIndex: 30,
                      height: "100%",
                    }}
                  >
                    <Text
                      style={{
                        color: themeStyle.TEXT_PRIMARY_COLOR,
                        right: 26,
                        top: 20,
                        fontSize: 20,
                        fontWeight: "900",
                        fontFamily: `${getCurrentLang()}-GS-Black-Bold`,
                        zIndex: 5,
                      }}
                    >
                      X
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ paddingLeft: 10 }}>
                <View style={{ marginTop: 0 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {t("suggestions-images")}
                  </Text>
                  <View style={{ marginTop: 0 }}>
                    {renderImagesListByType("1")}
                  </View>
                  <View style={{ marginTop: 15 }}>
                    {renderImagesListByType("2")}
                  </View>
                </View>
              </View>
              <View style={{ alignItems: "center", marginTop: 5 }}>
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {t("or-add-personal-image")}
                </Text>
              </View>
              <View style={{ alignItems: "center", marginTop: 5 }}>
                {imageList && (
                  <View style={{ alignItems: "center", marginTop: 5 }}>
                    <Image
                      source={{
                        uri: imageList.uri,
                      }}
                      style={{ width: 100, height: 100 }}
                    />

                    <View>
                      <TouchableOpacity
                        onPress={onImageSelect}
                        style={{
                          width: "100%",
                          marginTop: 5,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ textDecorationLine: "underline" }}>
                          {t("replace-image-here")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {!imageList && (
                  <TouchableOpacity
                    onPress={onImageSelect}
                    style={{
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ textDecorationLine: "underline" }}>
                      {t("add-image-here")}
                    </Text>
                    <Icon icon="add_image" size={80} />
                  </TouchableOpacity>
                )}
              </View>
            </Dialog.Content>
            <Dialog.Actions style={{ alignItems: "center", paddingBottom: 30 }}>
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <View style={{ alignSelf: "center", width: "50%" }}>
                  <Button
                    onClickFn={handleSaveClick}
                    text={t("approve")}
                    textColor={themeStyle.WHITE_COLOR}
                    fontSize={16}
                  />
                </View>
              </View>
            </Dialog.Actions>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  bannerLinear: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  banner: {
    position: "absolute",
    left: -60,
    top: 10,
    width: 180,
    transform: [{ rotate: "45deg" }],
    // backgroundColor: themeStyle.PRIMARY_COLOR,
    color: "white",
    padding: 0,
    textAlign: "center",
    zIndex: 1,
  },
});
