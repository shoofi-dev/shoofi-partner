import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { getCurrentLang } from "../../translations/i18n";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { color } from "react-native-reanimated";

const LanguageScreen = ({ route }) => {
  const { languageStore } = useContext(StoreContext);
  const navigation = useNavigation();
  const { isFromTerms } = route.params;

  const onChangeLanguage = (lng) => {
    languageStore.changeLang(lng);
    if(isFromTerms){
      navigation.navigate("homeScreen");
    }else{
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
             {/* <LinearGradient
          colors={[
            "rgba(207, 207, 207, 0.6)",
            "rgba(232, 232, 230, 0.5)",
            "rgba(232, 232, 230, 0.4)",
            "rgba(232, 232, 230, 0.4)",
            "rgba(207, 207, 207, 0.6)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        /> */}
      <View style={{ alignItems: "center" }}>
        <View>
          <Text
            style={{
              ...styles.textLang,
              color:themeStyle.SECONDARY_COLOR
            }}
          >
            أختر اللغة
          </Text>
          <Text
            style={{
              ...styles.textLang,
              fontFamily: "he-SemiBold",
              color:themeStyle.SECONDARY_COLOR

            }}
          >
            בחר שפה
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            height: "50%",
            justifyContent: "space-around",
            width: "100%",
            marginTop:30
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor:
              getCurrentLang() === "ar" && themeStyle.PRIMARY_COLOR,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal:20,
            borderRadius:20,
            borderWidth:getCurrentLang() !== "ar" ? 1 : 0,
            borderColor:themeStyle.PRIMARY_COLOR

            }}
            onPress={() => {
              onChangeLanguage("ar");
            }}
          >
            {/* { getCurrentLang() === "ar" &&<LinearGradient
            colors={["#a77948", "#eaaa5c"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.background,{borderRadius:20}]}
          /> }  */}
            <Text style={{  fontSize: 29,
             color: getCurrentLang() === "ar" ? themeStyle.WHITE_COLOR : themeStyle.PRIMARY_COLOR,
            }}>
              العربية
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor:
                getCurrentLang() === "he" && themeStyle.SECONDARY_COLOR,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal:20,
              borderRadius:20,
              borderWidth:getCurrentLang() !== "he" ? 1 : 0,
              borderColor:themeStyle.SECONDARY_COLOR
            }}
            onPress={() => {
              onChangeLanguage("he");
            }}
          >
        
            <Text style={{ fontFamily: "he-SemiBold", fontSize: 29,             color: getCurrentLang() === "he" ? themeStyle.WHITE_COLOR : themeStyle.SECONDARY_COLOR,
 }}>
            עברית
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default observer(LanguageScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent:'center',
    alignSelf:'center',
  },
  textLang: {
    //   fontFamily: props.fontFamily + "Bold",
    fontSize: 29,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: "0%",
    borderRadius: 0,
  },
});
