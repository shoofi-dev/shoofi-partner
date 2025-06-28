import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import themeStyle from "../../../styles/theme.style";
import * as Haptics from "expo-haptics";
import Icon from "../../icon";

export default function Counter({
  onCounterChange,
  value,
  stepValue = 1,
  minValue = 0,
  isVertical = false,
  variant = null,
  size = 35,
  showTrashAtMinValue = false,
  onDelete,
  useCartStyle = false,
}) {
  const [couter, setCounter] = useState(value || 0);
  const onBtnClick = (value) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if ((couter === 0 && value === -1) || couter + value < minValue) {
      return;
    }
    const updatedValue = couter + value;
    setCounter(updatedValue);
    onCounterChange(updatedValue);
  };
  useEffect(() => {
    setCounter(value || 0);
  }, [value]);

  const isTrashState = showTrashAtMinValue && couter === minValue;

  const containerStyles = [
    styles.container,
    useCartStyle && styles.cartContainer,
  ];
  
  const textStyles = [
    styles.buttonText,
    useCartStyle && styles.cartButtonText,
  ];

  const countTextStyles = [
    styles.countText,
    useCartStyle && styles.cartCountText,
  ];

  return (
    <View style={containerStyles}>
      <TouchableOpacity
        onPress={() => {
          onBtnClick(stepValue);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={textStyles}>+</Text>
      </TouchableOpacity>
      <Text style={countTextStyles}>{couter}</Text>
      <TouchableOpacity
        onPress={() => {
          if (isTrashState) {
            onDelete && onDelete();
          } else {
            onBtnClick(-stepValue);
          }
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isTrashState ? (
          <Icon icon="trash" size={18} color={useCartStyle ? '#374151' : "#444"} />
        ) : (
          <Text style={textStyles}>-</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeStyle.GRAY_10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 50,
    justifyContent: "space-between",
  },
  cartContainer: {
    backgroundColor: "white",
    borderColor: '#E5E7EB',
    borderWidth: 1,

  },
  buttonText: {
    fontSize: themeStyle.FONT_SIZE_MD,
  },
  cartButtonText: {
    color: '#374151',
    fontWeight: 'normal',
    fontSize: 22,
  },
  countText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "bold",
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: "center",
  },
  cartCountText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 18
  },
  containerGray: {
    borderRadius: 50,
    shadowColor: themeStyle.GRAY_600,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    borderWidth: 0,
    backgroundColor: "white",
  },
  counterValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: themeStyle.SECONDARY_COLOR,
    borderRadius: 10,
    width: 40,
  },
  btn: {
    // backgroundColor: themeStyle.PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    color: themeStyle.SECONDARY_COLOR,
    borderColor: themeStyle.SECONDARY_COLOR,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  btnGray: {
    backgroundColor: themeStyle.GRAY_700,

    width: 35,
    height: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: themeStyle.PRIMARY_COLOR,
    borderColor: themeStyle.SECONDARY_COLOR,
    borderRadius: 10,
  },
  btnGreen: {
    backgroundColor: themeStyle.WHITE_COLOR,
    width: 35,
    height: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: themeStyle.SUCCESS_COLOR,
    borderColor: themeStyle.SUCCESS_COLOR,
  },
  btnTextGray: {
    fontSize: 25,
    color: themeStyle.SECONDARY_COLOR,
    fontFamily: "Poppins-Regular",
  },
  btnTextGreen: {
    fontSize: 18,
    color: themeStyle.SECONDARY_COLOR,
    fontFamily: "Poppins-Regular",
  },
  btnTextRed: {
    fontSize: 18,
    color: themeStyle.ERROR_COLOR,
    fontFamily: "Poppins-Regular",
  },
  btnText: {
    fontSize: 20,
    color: themeStyle.SECONDARY_COLOR,
    fontFamily: "Poppins-Regular",
  },
});
