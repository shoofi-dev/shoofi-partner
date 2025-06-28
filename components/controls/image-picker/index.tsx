import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { useState, useEffect } from "react";
import themeStyle from "../../../styles/theme.style";
import { launchImageLibrary } from "react-native-image-picker";
import Icon from "../../icon";
import { cdnUrl } from "../../../consts/shared";
import { useTranslation } from "react-i18next";

export default function ImagePicker({handleImageSelect}) {
  const { t } = useTranslation();

  const [image, setImage] = useState();

  const onImageSelect = async () => {
    const result = await launchImageLibrary({ mediaType: "photo" });
    setImage(result.assets[0]);
    handleImageSelect(result.assets[0])
  };

  return (
    <View style={{}}>
      {image && (
        <View>
          <Image
            source={{
              uri: `${image.uri}`,
            }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          <TouchableOpacity  onPress={onImageSelect} style={{marginTop:10}}>
            <Text style={{textDecorationLine:"underline"}}>{t("replace-image")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!image && (
        <TouchableOpacity
          onPress={onImageSelect}
          style={{
            backgroundColor: themeStyle.PRIMARY_COLOR,
            width: "100%",
            padding: 10,
            // height: "40%"
          }}
        >
          <Icon icon="add_image" size={50} />
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  counterValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 20,
    color: "white",
  },
});
