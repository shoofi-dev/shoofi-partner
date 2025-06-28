import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { ToggleButton } from "react-native-paper";
import Icon from "../../icon";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";

export default function ToggleControl({ onChange, value, option1, option2 }) {

  const { t } = useTranslation();

  

  return (
    <View style={{...styles.container}}>
   <ToggleButton.Row
                onValueChange={(value) => onChange(value)}
                value={value}
                style={styles.togglleContainer}
              >
                <ToggleButton
                  style={{
                    ...styles.togglleCItem,
                    backgroundColor:
                    value === option1
                        ? themeStyle.SECONDARY_COLOR
                        : "transparent",
                    borderTopRightRadius: 50,
                    borderBottomRightRadius: 50,
                  }}
                  icon={() => (
                    <View style={styles.togglleItemContentContainer}>
                      {/* <Icon
                        icon="delivery-active"
                        size={25}
                        style={{
                          color:
                            selectedValue === option1
                              ? themeStyle.TEXT_PRIMARY_COLOR
                              : themeStyle.WHITE_COLOR,
                        }}
                      /> */}

                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color:
                          value === option1
                              ? themeStyle.TEXT_PRIMARY_COLOR
                              : themeStyle.WHITE_COLOR,
                        }}
                      >
                        {t(option1)}
                      </Text>
                    </View>
                  )}
                  value={option1}
                />
                <ToggleButton
                  style={{
                    ...styles.togglleCItem,
                    backgroundColor:
                    value === option2
                        ? themeStyle.SECONDARY_COLOR
                        : "transparent",
                    borderTopLeftRadius: 50,
                    borderBottomLeftRadius: 50,
                  }}
                  icon={() => (
                    <View style={styles.togglleItemContentContainer}>
                      {/* <Icon
                        icon="cart_icon"
                        size={25}
                        style={{
                          color:
                            selectedValue === option2
                              ? themeStyle.TEXT_PRIMARY_COLOR
                              : themeStyle.WHITE_COLOR,
                        }}
                      /> */}

                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color:
                          value === option2
                              ? themeStyle.TEXT_PRIMARY_COLOR
                              : themeStyle.WHITE_COLOR,
                        }}
                      >
                        {t(option2)}
                      </Text>
                    </View>
                  )}
                  value={option2}
                />
              </ToggleButton.Row>
            </View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center"
  },
  togglleContainer: {
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 2,
    overflow: "hidden",
    borderColor: themeStyle.PRIMARY_COLOR,
    flexDirection: "row",
    width: "100%",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  togglleCItem: {
    borderWidth: 0,

    borderRadius: 50,
    flex: 1,
    alignItems: "flex-start",
  },
  togglleItemContent: {},
  togglleItemContentContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },
});
