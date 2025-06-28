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
import DashedLine from "react-native-dashed-line";
import EditTranslationsDialog from "../../../components/dialogs/translations/edit-translations";

const EditTranslationsScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { menuStore, translationsStore } = useContext(StoreContext);

  // const [categoryList, setCategoryList] = useState();

  const [translationsList, setTranslationsList] = useState();
  const [isOpenTranslationsDialog, setIsOpenTranslationsDialog] = useState(
    false
  );
  const [editData, setEditData] = useState();

  useEffect(() => {
    if (translationsStore.translationsData) {
      setTranslationsList(translationsStore.translationsData);
    }
  }, [translationsStore.translationsData]);

  const handleInputChange = (value: any, key: string, lng: string) => {
    setTranslationsList({
      ...translationsList,
      [lng]: { ...translationsList[lng], [key]: value },
    });
  };

  const handlEditDialogAnswer = (answer:any) => {
    if (answer.data) {
      if(answer.isAddNew){
        translationsStore.addTranslations(answer.data);
      }else{
        translationsStore.updateTranslations(answer.data);
      }
      setEditData(null);
      setIsOpenTranslationsDialog(false);
    } else {
      setEditData(null);
      setIsOpenTranslationsDialog(false);
    }
  };
  const handleEditClick = (data) => {
        setEditData(data);
    setIsOpenTranslationsDialog(true);
  };

  const handlAddClick = () => {
    setIsOpenTranslationsDialog(true);
  };

  const handleDeleteClick = (data) => {
    translationsStore.deleteTranslations(data);
  };

  const navigateToMenu = () => {
    navigation.navigate("menuScreen");
  };

  return (
    <View style={{ height: "100%" }}>
      {isOpenTranslationsDialog && (
        <View
          style={{
            zIndex: 1,
            position: "absolute",
            height: "100%",
            width: "100%",
          }}
        >
          <EditTranslationsDialog
            isOpen={isOpenTranslationsDialog}
            handleAnswer={handlEditDialogAnswer}
            editData={editData}
          />
        </View>
      )}

      <ScrollView style={styles.container}>
        <View style={styles.inputsContainer}>
          <Text style={{ marginTop: 10, fontSize: 25 }}>
            {t("edit-translations")}
          </Text>

          <Button
            bgColor={themeStyle.PRIMARY_COLOR}
            text={t("approve")}
            fontSize={20}
            onClickFn={handlAddClick}
          />

          {translationsList &&
            Object.keys(translationsList?.arTranslations).map((key) => (
              <View key={key}>
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginBottom: 15,
                    alignItems: "center",
                   
                  }}
                >
                  <View
                    style={{
                      flexBasis: "30%",
                      alignItems: "center",
                      paddingVertical: 20,
                      borderWidth: 1,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>
                      {translationsList.arTranslations[key]}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexBasis: "30%",
                      paddingVertical: 20,
                      alignItems: "center",
                      borderWidth: 1,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>
                      {translationsList.heTranslations[key]}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexBasis: "30%",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      borderWidth: 1,
                      flexWrap:"wrap"
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteClick()
                      }
                      style={{ padding: 15, zIndex: 2 }}
                    >
                      <Icon
                        icon="trash"
                        size={18}
                        style={{
                          color: themeStyle.ERROR_COLOR,
                          marginRight: 10,
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleEditClick({
                          key: key,
                          ar: translationsList.arTranslations[key],
                          he: translationsList.heTranslations[key],
                        })
                      }
                      style={{ padding: 15, zIndex: 2 }}
                    >
                      <Icon
                        icon="pencil"
                        size={18}
                        style={{
                          color: themeStyle.ORANGE_COLOR,
                          marginRight: 10,
                        }}
                      />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20 }}>{key}</Text>
                  </View>
                </View>
                {/* <DashedLine
                dashLength={5}
                dashThickness={3}
                dashGap={0}
                dashColor={themeStyle.PRIMARY_COLOR}
              /> */}
              </View>
            ))}
          {/* <View style={{position:"absolute",top:120, height:300, width:"100%"}}>
  
          </View> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default observer(EditTranslationsScreen);

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
