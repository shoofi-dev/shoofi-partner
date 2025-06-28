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
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";
import { getCurrentLang } from "../../../../../translations/i18n";

const subCategoryItems = [
  {
    id: "1",
    icon: "special-cake",
    name: "كعكات حفل ميلاد",
    imgSrc: require("../../../../../assets/categories/birthday-cakes/b-standart.jpg"),
  },
  {
    id: "2",
    icon: "boy",
    name: "اولاد",
    imgSrc: require("../../../../../assets/categories/birthday-cakes/b-boys.jpg"),
  },
  {
    id: "3",
    icon: "girl",
    name: "بنات",
    imgSrc: require("../../../../../assets/categories/birthday-cakes/b-girls.jpg"),
  },
  {
    id: "4",
    icon: "young",
    name: "صبايا وشباب",
    imgSrc: require("../../../../../assets/categories/birthday-cakes/b-young.jpg"),
  },
  {
    id: "5",
    icon: "special-event",
    name: "مناسبات خاصة",
    imgSrc: require("../../../../../assets/categories/birthday-cakes/special-event.jpg"),
  },
  { id: "6", icon: "custom-design", name: "تصميم خاص" },
];

type TProps = {
  onChange: (value) => void;
  selectedSubCategory?: any;
  categoryId?: any;
};
const BirthdayCakes = ({
  onChange,
  selectedSubCategory,
  categoryId,
}: TProps) => {
  const { userDetailsStore, menuStore, languageStore } =
    useContext(StoreContext);
  const [selectedItem, setSelectedItem] = useState("1");
  const value = useRef(new Animated.Value(0));
  useEffect(() => {
    if (
      subCategoryItems?.length > 0 &&
      categoryId == "5" &&
      !selectedSubCategory
    ) {
      Animated.timing(value.current, {
        toValue: subCategoryItems.length + +1,
        useNativeDriver: true,
        duration: subCategoryItems.length * 500,
        easing: Easing.linear,
      }).start();
    }
  }, [selectedSubCategory, categoryId]);
  const [rotateAnimation, setRotateAnimation] = useState(new Animated.Value(0));
  const handleAnimation = () => {
    // @ts-ignore
    Animated.timing(rotateAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      rotateAnimation.setValue(0);
    });
  };
  const interpolateRotating = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const handleItemSelect = (value: string) => {
    setSelectedItem(value);
    onChange(value);
  };

  return (
    <ScrollView>
      <View style={{ alignItems: "center", paddingBottom: 50, }}>
        {subCategoryItems.map((subCat, index) => {
          const moveBy = (1 - 1 / 1) * index;

          if (subCat.id != "6") {
            return (
              <Animated.View
                style={{
                  borderRadius: 20,
                  overflow:"hidden",
                  flexDirection: "row",
                  width: "80%",
                  height: 100,
                  marginTop: 20,

                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf:'center',
                  shadowColor: "#C19A6B",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.9,
                  shadowRadius: 6,
                  elevation: 5,
                  borderWidth: 0,
                  opacity: value.current.interpolate({
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
                    
                  }),
                }}
              >
                        <LinearGradient
                          colors={[
                            "rgba(207, 207, 207, 0.4)",
                            "rgba(246,246,247, 0.8)",
                            "rgba(246,246,247, 0.8)",
                            "rgba(207, 207, 207, 0.4)",
                          ]}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.background]}
                        />
                  <TouchableOpacity
                    onPress={() => {
                      handleItemSelect(subCat.id);
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      flexDirection:'row',
                      borderRadius: 20,

                    }}
                    key={subCat.id}
                  >
                           <View
                                style={{
                                  width: 130,
                                  height: 100,
                                }}
                              >
                                <Image
                                  style={{
                                    width: "90%",
                                    height: "100%",
                                    marginLeft: 0,
                                    borderRadius: 20,
                                  }}
                                  source={
                                     subCat?.imgSrc
                                  }
                                />
                              </View>
                              <View style={{        alignItems:'center',
                      justifyContent:'center',
         
                      width:"50%"}}>
                              <Text
                    style={{
                      color: themeStyle.TEXT_PRIMARY_COLOR,
                      fontSize: 18,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
              
                    }}
                  >
                    {subCat.name}
                  </Text>
                              </View>
                {/* <ImageBackground
                  source={subCat?.imgSrc}
                  resizeMode="cover"
                  style={{
                    height: "100%",
                    backgroundColor: "white",
                    width: "100%",
                  }}
                > */}
                </TouchableOpacity>
                {/* </ImageBackground> */}
                {/* <View
                  style={{
                    backgroundColor: "rgba(247,247,247,0.8)",
                    alignItems: "center",
                    padding: 7,
                    position: "absolute",
                    top: -37,
                    borderTopEndRadius: 20,
                    borderTopStartRadius: 20,
                    borderBottomEndRadius: subCat.id == "6" ? 20 : 0,
                    borderBottomStartRadius: subCat.id == "6" ? 20 : 0,
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      color: themeStyle.TEXT_PRIMARY_COLOR,
                      fontSize: 18,
                      fontFamily: `${getCurrentLang()}-SemiBold`,
                    }}
                  >
                    {subCat.name}
                  </Text>
                </View> */}
              </Animated.View>
            );
          } else {
            return (
              <Animated.View
                style={{
                  width: "80%",

                  marginTop: 100,
                  height: 0,
                  // shadowColor: "#000",
                  // shadowOffset: {
                  //   width: 0,
                  //   height: 2,
                  // },
                  // shadowOpacity: 0.1,
                  // shadowRadius: 3.84,
                  shadowColor: "#C19A6B",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.9,
                  shadowRadius: 6,
                  elevation: 5,
                  borderWidth: 0,
                  opacity: value.current.interpolate({
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
                  }),
                }}
              >
                
                <TouchableOpacity
                  onPress={() => {
                    handleItemSelect(subCat.id);
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  key={subCat.id}
                >
                      
                  <View
                    style={{
                      alignItems: "center",
                      padding: 7,
                      position: "absolute",
                      top: -37,
                      borderTopEndRadius: 20,
                      borderTopStartRadius: 20,
                      borderBottomEndRadius: subCat.id == "6" ? 20 : 0,
                      borderBottomStartRadius: subCat.id == "6" ? 20 : 0,
                      width: "100%",
                    }}
                  >
                              <LinearGradient
                          colors={[
                            "rgba(207, 207, 207, 0.4)",
                            "rgba(246,246,247, 0.8)",
                            "rgba(246,246,247, 0.8)",
                            "rgba(207, 207, 207, 0.4)",
                          ]}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.background,{borderRadius:20}]}
                        />
                    <Text
                      style={{
                        color: themeStyle.TEXT_PRIMARY_COLOR,
                        fontSize: 18,
                        fontFamily: `${getCurrentLang()}-SemiBold`,
                      }}
                    >
                      {subCat.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }
        })}
      </View>
    </ScrollView>
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
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 2,
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
