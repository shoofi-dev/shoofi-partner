import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { useState, useEffect } from "react";
import themeStyle from "../../../styles/theme.style";
import Icon from "../../icon";
import Button from "../button/button";
import * as Haptics from "expo-haptics";
import Text from "../Text";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export default function CheckBox({
  onChange,
  value,
  title = undefined,
  variant = "default",
  isOneChoice = false,
  isDisabled = false,
  isActive = false,
  color = themeStyle.TEXT_PRIMARY_COLOR
}) {
  const { t } = useTranslation();

  const [isSelected, setIsSelected] = useState(value);
  const onBtnClick = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // if (isOneChoice && value) {
    //   return;
    // }
    setIsSelected(isOneChoice ? isSelected : !isSelected);
    onChange && onChange(isOneChoice ? value : !isSelected);
  };
  useEffect(() => {
    setIsSelected(value);
  }, [value]);

  const sizeTitleAdapter = (title: string) => {
    switch (title) {
      case "large":
        return "L";
      case "medium":
        return "S";
      default:
        return null;
    }
  };
  if (variant === "button" && isOneChoice) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            // borderColor: isActive
            //   ? themeStyle.SUCCESS_COLOR
            //   : themeStyle.WHITE_COLOR,
            // borderWidth: isActive ? 3 : 0,
            backgroundColor:themeStyle.SECONDARY_COLOR,
          },
        ]}
        onPress={() => onChange(title)}
      >
        {isActive && (
          <Icon
            icon={"checked-green"}
            style={{
              alignSelf: "center",
              position: "absolute",
              top: -25,
              zIndex: 20,
            }}
            size={30}
          />
        )}
        <View
          style={{
            width: "100%",
            alignItems: "center",
            overflow:'hidden', 
            flexDirection:'column',
            justifyContent:'space-between',
            height:"100%"
            
                   }}
        >
          {/* // <Button
            //   fontSize={15}
            //   onClickFn={() => onChange(title)}
            //   text={title}
            //   textColor={themeStyle.WHITE_COLOR}
            //   bgColor={themeStyle.PRIMARY_COLOR}
            //   borderRadious={10}
            //   isFlexCol
            //   textPadding={0}
            // /> */}
          <View
            style={{
              height: 70,
              width: 60,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: 'black',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 1,
              shadowRadius: 5,
              elevation: 40,
              borderWidth: 0,
              marginTop:10,
            }}
          >
            {/* <Image
              source={extrasImages[title]}
              style={{
                height: title === "medium" ? 60 : 70,
                width: title === "medium" ? 60 : 70,
    
              }}
              resizeMode="cover"
            /> */}
          </View>

          {/* // <Button
            //   fontSize={15}
            //   onClickFn={() => onChange(title)}
            //   text={title}
            //   textColor={themeStyle.TEXT_PRIMARY_COLOR}
            //   bgColor={themeStyle.WHITE_COLOR}
            //   borderRadious={10}
            //   textPadding={0}
            //   isFlexCol
            // /> */}

          <View style={{  width: isActive ? "100%" : "100%",paddingVertical:8,backgroundColor: isActive ? themeStyle.SUCCESS_COLOR : themeStyle.PRIMARY_COLOR, borderBottomEndRadius:20, borderBottomStartRadius:20  }}>
            {/* <LinearGradient
              colors={[
                "rgba(207, 207, 207, 0.9)",
                "rgba(246,246,247, 0.9)",
                "rgba(246,246,247, 0.9)",
                "rgba(246,246,247, 0.9)",
                "rgba(246,246,247, 0.9)",
                "rgba(246,246,247, 0.9)",
                "rgba(207, 207, 207, 0.9)",
              ]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.backgroundx]}
            /> */}
            <Text
              style={{
                color: isActive
                  ? themeStyle.WHITE_COLOR
                  : themeStyle.WHITE_COLOR,
                alignSelf: 'center'
              }}
            >
              {t(title)}
            </Text>
          </View>
          {/* <View>
                  <Text type="number">+{options[key].price}</Text>
                </View> */}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "button") {
    return (
      <View style={styles.container}>
        <View
          onTouchEnd={() => {
            onBtnClick();
          }}
          style={{ height: 50, width: 90 }}
        >
          {isSelected ? (
            <Button
              fontSize={15}
              onClickFn={() => onChange(value)}
              text={title}
              textColor={themeStyle.BROWN_700}
              bgColor={themeStyle.PRIMARY_COLOR}
              borderRadious={10}
              isFlexCol
              textPadding={0}
            />
          ) : (
            <Button
              fontSize={15}
              onClickFn={() => onChange(value)}
              text={title}
              textColor={themeStyle.BROWN_700}
              bgColor={themeStyle.WHITE_COLOR}
              borderRadious={10}
              textPadding={0}
              isFlexCol
            />
          )}
        </View>
      </View>
    );
  }

  if (isOneChoice) {
    return (
      <View style={{ flexDirection: 'row', opacity: isDisabled ? 0.5 : 1, alignItems:'center', justifyContent:'space-between' }}>
        {sizeTitleAdapter(title) && (
          <Text style={{ marginBottom: 10, fontSize: 20 }}>
            {sizeTitleAdapter(title)}
          </Text>
        )}

        <Text style={{fontSize: 20}}>              {t(title)}
        </Text>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderRadius: 5,
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            borderColor: themeStyle.PRIMARY_COLOR,
          }}
          onPress={() => {
            onChange(title);
          }}
          disabled={isDisabled}
        >
          {isActive ? (
            <View
              style={{ height: 25, width: 25, borderRadius: 5, padding: 5, backgroundColor:themeStyle.PRIMARY_COLOR }}
            >
  
            </View>
          ) : (
            <View></View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
    style={{
      flexDirection: "row",
      opacity: isDisabled ? 0.5 : 1,
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {sizeTitleAdapter(title) && (
      <Text style={{ marginBottom: 10, fontSize: 20 }}>
        {sizeTitleAdapter(title)}
      </Text>
    )}

    <Text style={{ fontSize: 20, color: color }}> {t(title)}</Text>

    <TouchableOpacity
      style={{
        borderWidth: 1,
        borderRadius: 5,
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        borderColor: themeStyle.WHITE_COLOR,
      }}
      onPress={() => {
        onBtnClick();
      }}
      disabled={isDisabled}
    >
      {isSelected ? (
        <View
          style={{
            height: 25,
            width: 25,
            borderRadius: 5,
            padding: 5,
            backgroundColor: themeStyle.SECONDARY_COLOR,
          }}
        ></View>
      ) : (
        <View></View>
      )}
    </TouchableOpacity>
  </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: 120,
    width: 110,
    //  backgroundColor:  false ? themeStyle.SUCCESS_COLOR : themeStyle.WHITE_COLOR,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 40,
    borderWidth: 0,
    backgroundColor: "#FFF5EE",
  },
  counterValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
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
  },
  unchecked: {
    borderWidth: 1,
    borderRadius: 20,
    width: 30,
    height: 30,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 30,
  },
  backgroundx: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,

  },
});
