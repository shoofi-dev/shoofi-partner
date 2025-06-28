import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import theme from "../../../styles/theme.style";
import Icon from "../../icon";
import themeStyle from "../../../styles/theme.style";
import { ActivityIndicator } from "react-native-paper";
import * as Haptics from "expo-haptics";
import Text from "../Text";
import { getCurrentLang } from "../../../translations/i18n";
import { LinearGradient } from "expo-linear-gradient";

type TProps = {
  onClickFn: any;
  text: any;
  icon?: any;
  iconSize?: any;
  iconColor?: any;
  iconPosition?: "right" | "left";
  fontSize?: any;
  bgColor?: any;
  textColor?: any;
  fontFamily?: any;
  disabled?: boolean;
  isLoading?: boolean;
  borderRadious?: number;
  textPadding?: number;
  isFlexCol?: boolean;
  borderWidth?: boolean;
  marginH?: number;
  iconMargin?: number;
  extraText?: string;
  countText?: string;
  countTextColor?: string;
  fontFamilyExtraText?: string;
  isOposetGradiant?: boolean;
  borderColor?: string;
  borderWidthNumber?: number;
  transformIconAnimate?: any;
};
export default function Button({
  onClickFn,
  text,
  icon,
  iconSize,
  fontSize,
  iconColor,
  iconPosition = "right",
  bgColor,
  textColor,
  fontFamily,
  disabled,
  isLoading,
  borderRadious,
  textPadding,
  isFlexCol,
  marginH,
  iconMargin,
  extraText,
  countText,
  countTextColor,
  fontFamilyExtraText,
  borderWidth = true,
  isOposetGradiant,
  borderColor,
  borderWidthNumber,
  transformIconAnimate,
}: TProps) {
  const onBtnClick = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClickFn();
  };

  const getBorderWitdth = () => {
    if (borderWidthNumber) {
      return borderWidthNumber;
    }
    return borderWidth && bgColor ? 1 : 0;
  };

  const getBorderColor = () => {
    if (borderColor) {
      return borderColor;
    }
    if (disabled) {
      return themeStyle.GRAY_600;
    }

    if (bgColor == "white" || bgColor == themeStyle.PRIMARY_COLOR) {
      return themeStyle.TEXT_PRIMARY_COLOR;
    }

    if (bgColor) {
      return themeStyle.TEXT_PRIMARY_COLOR;
    }
  };
  const renderIcon = () => (
    <Animated.View
      style={{
        transform: transformIconAnimate,
      }}
    >
      <Icon
        icon={icon}
        size={iconSize ? iconSize : 20}
        style={{
          color: textColor || theme.GRAY_700,
          marginBottom: isFlexCol ? 10 : 0,
          marginRight: iconMargin ? iconMargin : 0,
        }}
      />
    </Animated.View>
  );
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          width: "100%",
          borderRadius: 999,
          borderWidth: borderWidthNumber ? borderWidthNumber : 0,
          borderColor: borderColor ? borderColor : themeStyle.GRAY_30,
          justifyContent: "center",
          alignItems: "center",
          padding: 15,
          backgroundColor: bgColor || themeStyle.PRIMARY_COLOR,
        }}
        disabled={disabled}
        onPress={onBtnClick}
        activeOpacity={0.8}
      >
        {/* <LinearGradient
          colors={["#5fd100", "#00b32a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        > */}
        <View style={styles.row}>
          {countText && (
            <View style={styles.countTextContainer}>
                <Text style={{
                color: countTextColor ? countTextColor : "#fff",
                fontWeight: "bold",
                fontSize: fontSize ? fontSize : themeStyle.FONT_SIZE_MD,
              }}>{countText}</Text>
            </View>
          )}

          {/* Centered text and icon */}
          <View style={styles.centerContent}>
            {icon && (
              <Animated.View
                style={{ marginRight: 8, transform: transformIconAnimate }}
              >
                <Icon
                  icon={icon}
                  size={iconSize ? iconSize : themeStyle.FONT_SIZE_MD}
                  style={{ color: iconColor ? iconColor : "#fff",  }}
                />
              </Animated.View>
            )}
            <Text style={{
                  color: textColor ? textColor : themeStyle.SECONDARY_COLOR,
                  fontWeight: "bold",
                  fontSize: fontSize ? fontSize : themeStyle.FONT_SIZE_MD,
                  textAlign: "center",
            }}>{text}</Text>
          </View>
          {/* Price on the left */}
          {extraText && (
            <View style={styles.extraTextContainer}>
                  {extraText && <Text style={styles.price}>{extraText}</Text>}
            </View>
          )}
        </View>
        {/* </LinearGradient> */}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  gradient: {
    width: "100%",
    borderRadius: 999,

    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  price: {
    color: themeStyle.SECONDARY_COLOR,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
   
  },
  countText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
  },
  countTextContainer: {
    backgroundColor: "#4E2E53",
    borderRadius: 50,
    alignSelf: "center",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  extraTextContainer: {

    justifyContent: "center",
    alignItems: "center",
    right:5,

  },
  centerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonText: {
    color: themeStyle.SECONDARY_COLOR,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "center",
  },
});
