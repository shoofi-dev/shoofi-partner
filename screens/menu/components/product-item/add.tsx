import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { ScrollView } from "react-native-gesture-handler";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { getCurrentLang } from "../../../../translations/i18n";
import * as Haptics from "expo-haptics";
import Button from "../../../../components/controls/button/button";
import { cdnUrl } from "../../../../consts/shared";

export type TProps = {
  onItemSelect: () => void;
};
const AddProductItem = ({ onItemSelect }: TProps) => (
  <TouchableOpacity
    style={[styles.categoryItem]}
    delayPressIn={0}
    onPress={() => {
      onItemSelect();
    }}
  >
 
    <Text
      style={{
        color: themeStyle.GRAY_700,
        marginTop: 5,
        fontSize: 18,
        fontFamily: `${getCurrentLang()}-SemiBold`,
        textAlign: "center",
          }}
    >
      + הוסף מוצר חדש 
    </Text>
  </TouchableOpacity>
);

export default observer(AddProductItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    // backgroundColor:"#857C74",
    // height:"100%"
  },
  categoryItem: {
    width: "95%",
    height: 350,
    justifyContent:"center",

     //height: 280,
    borderRadius: 30,
    backgroundColor:"rgba(255, 255, 255, 0.7)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    shadowColor: "#C19A6B",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 8,
    paddingBottom:15,
    alignSelf: 'center'    // backgroundColor:"#857C74",
  },
  iconContainer: {
    width: "100%",
    height: 200,
    
  },
  square: {
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 4,
    height: 150,
    shadowColor: "black",
    width: 150,
  },
});