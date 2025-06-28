import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import theme from "../../styles/theme.style";
import Icon from "../icon";
import * as Haptics from "expo-haptics";
import themeStyle from "../../styles/theme.style";
import Text from "../controls/Text";
import { useResponsive } from "../../hooks/useResponsive";
import GlassBG from "../glass-background";

export type TProps = {
  goTo?: string;
  onClick?: any;
  color?: string;
  isDisableGoBack?: boolean;
};
export default function BackButton({ goTo, onClick, color = themeStyle.BLACK_COLOR, isDisableGoBack = false }: TProps) {
  const navigation = isDisableGoBack ? null: useNavigation();
  const { isTablet, scale, fontSize } = useResponsive();

  const onBtnClick = () => {
    console.log("onBtnClick");
    onClick && onClick();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isDisableGoBack) {
      return;
    }
    const routes = navigation.getState()?.routes;
    const currentRoute = routes[routes.length - 1]; // -2 because -1 is the current route
    const prevRoute = routes[routes.length - 2]; // -2 because -1 is the current route

    if (
      (currentRoute.name === "cart" || currentRoute.name === "profile") &&
      (prevRoute.name === "verify-code" ||
        prevRoute.name === "insert-customer-name")
    ) {
      navigation.navigate("homeScreen");
      return;
    }
    if (goTo) {
      navigation.navigate(goTo);
      return;
    }
    navigation.goBack();
  };

  return (
    <GlassBG style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          onBtnClick();
        }}
        
      >
   <Icon icon="chevron_back" size={20} color={color} />
            {/* <Text style={{fontSize:20, color:themeStyle.BLACK_COLOR}}>{'>'}</Text> */}
      </TouchableOpacity>
      </GlassBG>
    
  );
}
const styles = StyleSheet.create({
  container: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 50,
  },
  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    borderRadius: 30,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  buttonText: {
    marginHorizontal: 20,
  },
});
