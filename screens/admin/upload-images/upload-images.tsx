import { StyleSheet, View, TextInput, Image } from "react-native";
import InputText from "../../../components/controls/input";
import Button from "../../../components/controls/button/button";
import Text from "../../../components/controls/Text";
import { observer } from "mobx-react";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import DropDown from "../../../components/controls/dropdown";
import themeStyle from "../../../styles/theme.style";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { StoreContext } from "../../../stores";
import Icon from "../../../components/icon";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { cdnUrl } from "../../../consts/shared";
import CheckBox from "../../../components/controls/checkbox";


const UploadImagesScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const imagesSubTypes = [{
    label: 'for-boys',
    value: 1
  },
  {
    label: 'for-girls',
    value: 2
  }]
  const { menuStore } = useContext(StoreContext);


  const [imageList, setImageList] = useState();
  const [subType, setSubType] = useState('1');
  const [subTypeList, setSubTypeList] = useState();


  useEffect(() => {
    setSubTypeList(imagesSubTypes)
  }, []);

  const onImageSelect = async () => {
    // setImageList(result);
  };

  const handleInputChange = (value: any) => {
    setSubType(value)
  };

  const handlAddClick = () => {
   
      //setIsLoading(true);
      //uploadImage(imgFile).then((res) => {
      // let updatedData = {};
      // if (image) {
      //   updatedData = {  img: image };
      // } 
      
      menuStore
        .uploadImages(imageList, subType)
        .then((res: any) => {
          //menuStore.getMenu();
          //setIsLoading(false);
          navigateToMenu();
        });

  };

  const navigateToMenu = () => {
    navigation.navigate("menuScreen");

  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputsContainer}>
        <Text style={{ marginTop: 10, fontSize: 25 }}>{t("add-product")}</Text>

        <View
          style={{
            width: "100%",
            marginTop: 20,
            alignItems: "flex-start",
            zIndex: 10,
          }}
        >
          {subTypeList && (
            <View style={{ alignItems: "flex-start" }}>
              <DropDown
                itemsList={subTypeList}
                defaultValue={subType}
                onChangeFn={(e) => handleInputChange(e)}
              />
            </View>
          )}
        </View>
        
        {imageList?.map((image)=>
          <Image
            source={{
              uri: image.path,
            }}
            style={{ width: 200, height: 200 }}
          />
        )}
{/* 
        {!image  && (
          <Image
            source={{
              uri: `${cdnUrl}${product.img[0].uri}`,
            }}
            style={{ width: 200, height: 200 }}
          />
        )} */}

        <TouchableOpacity
          onPress={onImageSelect}
          style={{
            backgroundColor: themeStyle.PRIMARY_COLOR,
            width: "100%",
            padding: 40,
            marginTop: 20,
          }}
        >
          <Icon icon="add_image" size={80} />
        </TouchableOpacity>

        <View style={{ width: "100%", paddingHorizontal: 50, marginTop: 25 }}>
          <Button
            bgColor={themeStyle.PRIMARY_COLOR}
            text={t("approve")}
            fontSize={20}
            onClickFn={handlAddClick}
            // isLoading={isLoading}
            // disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default observer(UploadImagesScreen);

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
