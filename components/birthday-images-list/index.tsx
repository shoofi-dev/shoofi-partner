import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../stores";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { getCurrentLang } from "../../translations/i18n";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
export type TProps = {
    categoryType: number;
}
const BirthdayImagesList = ({categoryType}: TProps) => {
  const { menuStore } = useContext(StoreContext);
  const navigation = useNavigation();

  const [imagesList, setImagesList] = useState();

    useEffect(()=>{
        if(categoryType === 4){
            menuStore.getImagesByCategory('birthday').then((res)=>{
              setImagesList(res);
            })
          }
    },[])
    
  return (
    <View style={styles.container}>
             <LinearGradient
          colors={[
            "rgba(207, 207, 207, 0.6)",
            "rgba(232, 232, 230, 0.5)",
            "rgba(232, 232, 230, 0.4)",
            "rgba(232, 232, 230, 0.4)",
            "rgba(207, 207, 207, 1)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.background]}
        />
      <View style={{ alignItems: "center" }}>
          <Text>aa</Text>
          {imagesList?.map((image)=>{
              return(<Text>{image.data.uri}</Text>)
          })}
      </View>
    </View>
  );
};
export default observer(BirthdayImagesList);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    width: "100%",
    height: "100%",
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
    bottom: 0,
    borderRadius: 50,
  },
});
