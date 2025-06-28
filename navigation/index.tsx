import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import AppContainer from "../components/layout/app-container";
import { ImageBackground } from "react-native";
import { observer } from "mobx-react";

const MyTheme = {
  ...DefaultTheme,
  fontSize: 40,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const RootNavigator = ({}) => {
  return (
    <NavigationContainer       theme={MyTheme}
    >

      <AppContainer/>
    </NavigationContainer>
  );
};

export default observer(RootNavigator);
