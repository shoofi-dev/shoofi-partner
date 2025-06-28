import { StyleSheet, View, TouchableOpacity } from "react-native";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import themeStyle from "../../../../styles/theme.style";

/* components */
import Icon from "../../../../components/icon";
import { getCurrentLang } from "../../../../translations/i18n";
import { useTranslation } from "react-i18next";

export type TProps = {
  onItemSelect: () => void;
};

const AddMenuItem = ({ onItemSelect }: TProps) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.categoryItem]}
      onPress={() => {
        onItemSelect();
      }}
    >
      <View
        style={[
          styles.iconContainer,

          {
            // backgroundColor:
            // category?._id === selectedCategory?._id
            //     ? themeStyle.PRIMARY_COLOR
            //     : themeStyle.WHITE_COLOR,
          },
        ]}
      >
        <Icon
          icon={"birthday-cake"}
          size={38}
          style={{
            color: themeStyle.GRAY_700,
          }}
        />
      </View>
      <Text
        style={[
          {
            marginTop: 10,
            color: themeStyle.GRAY_700,
            fontFamily: `${getCurrentLang()}-SemiBold`,
          },
        ]}
      >
        +ADD
      </Text>
    </TouchableOpacity>
  );
};

export default observer(AddMenuItem);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    alignContent: "space-between",
    paddingHorizontal: 5,
    paddingTop: 20,
    width: "100%",
    // backgroundColor: "#F1F1F1",
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 15,
    width: "100%",
    height: "100%",
  },
  itemsListConainer: {},
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
