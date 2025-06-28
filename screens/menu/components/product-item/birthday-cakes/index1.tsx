import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
  Text,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../../stores";
import themeStyle from "../../../../../styles/theme.style";
import CheckBox from "../../../../../components/controls/checkbox";
import Icon from "../../../../../components/icon";

const subCategoryItems = [
  { id: "1", icon: "special-cake" },
  { id: "2", icon: "boy" },
  { id: "3", icon: "girl" },
  { id: "4", icon: "young" },
];

type TProps = {
  onChange: (value) => void;
};
const BirthdayCakes = ({ onChange }: TProps) => {
  const { userDetailsStore, menuStore, languageStore } = useContext(
    StoreContext
  );
  const [selectedItem, setSelectedItem] = useState("1");

  const value = useRef(new Animated.Value(0));
  useEffect(() => {
    if (subCategoryItems?.length > 0) {

      Animated.timing(value.current, {
        toValue: subCategoryItems.length + 2,
        useNativeDriver: true,
        delay: 1000,
        duration: subCategoryItems.length * 500,
      }).start();
    }
  }, []);

  const handleItemSelect = (value: string) => {
    setSelectedItem(value);
    onChange(value);
  };

  return (
    <View
      style={{
        height: 50,
        marginTop: 15,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: themeStyle.WHITE_COLOR,
        justifyContent: "space-around",
        
      }}
    >
      {subCategoryItems.map((subCat, index) => {
                        const moveBy = (1 - 1 / 1) * index;

        return(
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: value.current.interpolate({
              inputRange:
                index === 0
                  ? [-1, 0, 1, 2]
                  : [
                      index - 1 - moveBy,
                      index - moveBy,
                      index + 1 - moveBy,
                      index + 2 - moveBy,
                    ],
              outputRange: [0, 0, 1, 1],
              extrapolate: "clamp",
            }) }],
            
          }}
          key={subCat.id}
        >
          <CheckBox
            onChange={() => {
              handleItemSelect(subCat.id);
            }}
            value={selectedItem == subCat.id}
          />
          <View style={{ padding: subCat.icon === "young" ? 5 : 0 }}>
            <Icon
              icon={subCat.icon}
              size={subCat.icon === "young" ? 40 : 35}
              style={{ marginBottom: subCat.icon === "young" ? 5 : 0 }}
            />
          </View>
        </Animated.View>
      )})}
    </View>
  );
};
export default observer(BirthdayCakes);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: 40,
    maxWidth: 600,
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  categoryItem: {
    marginBottom: 15,
    height: 360,
    justifyContent: "center",
    borderRadius: 30,
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
