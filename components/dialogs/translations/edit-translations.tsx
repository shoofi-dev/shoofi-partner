import { View, TextInput } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../../controls/Text";
/* styles */
import theme from "../../../styles/theme.style";
import Icon from "../../../components/icon";
import { useState, useEffect } from "react";
import Button from "../../../components/controls/button/button";
import themeStyle from "../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../translations/i18n";

type TProps = {
  isOpen: boolean;
  handleAnswer?: any;
  editData: { key: string; ar: string; he: string };
};

export default function EditTranslationsDialog({
  isOpen,
  handleAnswer,
  editData,
}: TProps) {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(isOpen);
  const [data, setData] = useState();
  const [isAddNew, setIsAddNew] = useState(false);

  useEffect(() => {
    setVisible(isOpen);

    let dataToHandle = {
      key: "",
      ar: "",
      he: "",
    };

    if (editData) {
      dataToHandle = editData;
    } else {
      setIsAddNew(true);
    }

    setData(dataToHandle);
  }, [isOpen]);

  const hideDialog = (value: any) => {
    handleAnswer && handleAnswer(value);
    setVisible(false);
  };

  const updateData = (value: string, key: string) => {
    const updatedData = {
      ...data,
      [key]: value,
    };
    setData(updatedData);
  };

  if (!data) {
    return;
  }
  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {},
          }}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 30,
            borderRadius: 10,
          }}
          visible={visible}
          dismissable={false}
        >
          <Dialog.Title>
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {data.key}
            </Text>
          </Dialog.Title>
          <Dialog.Content style={{ width: "100%", marginTop: 20 }}>
            <View style={{ width: "100%" }}>
              <View style={{ marginBottom: 15 }}>
                <TextInput
                  onChange={(e) => {
                    updateData(e.nativeEvent.text, "key");
                  }}
                  value={data.key}
                  placeholder={t("inser-notes-here")}
                  placeholderTextColor={themeStyle.GRAY_600}
                  multiline={true}
                  selectionColor="black"
                  underlineColorAndroid="transparent"
                  numberOfLines={5}
                  style={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    textAlignVertical: "top",
                    textAlign: "right",
                    padding: 10,
                    height: 70,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                  }}
                />
              </View>
              <View style={{ marginBottom: 15 }}>
                <TextInput
                  onChange={(e) => {
                    updateData(e.nativeEvent.text, "ar");
                  }}
                  value={data["ar"]}
                  placeholder={t("inser-notes-here")}
                  placeholderTextColor={themeStyle.GRAY_600}
                  multiline={true}
                  selectionColor="black"
                  underlineColorAndroid="transparent"
                  numberOfLines={5}
                  style={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    textAlignVertical: "top",
                    textAlign: "right",
                    padding: 10,
                    height: 70,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                  }}
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <TextInput
                  onChange={(e) => {
                    updateData(e.nativeEvent.text, "he");
                  }}
                  value={data["he"]}
                  placeholder={t("inser-notes-here")}
                  placeholderTextColor={themeStyle.GRAY_600}
                  multiline={true}
                  selectionColor="black"
                  underlineColorAndroid="transparent"
                  numberOfLines={5}
                  style={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    textAlignVertical: "top",
                    textAlign: "right",
                    padding: 10,
                    height: 70,
                    fontFamily: `${getCurrentLang()}-SemiBold`,
                  }}
                />
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <View
              style={{
                flexDirection: "row",
                width: "95%",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexBasis: "49%" }}>
                <Button
                  onClickFn={() => hideDialog({data, isAddNew})}
                  text={t("save")}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={16}
                  bgColor={themeStyle.SUCCESS_COLOR}
                />
              </View>
              <View style={{ flexBasis: "49%" }}>
                <Button
                  onClickFn={() => hideDialog(false)}
                  text={t("cancel")}
                  bgColor={themeStyle.GRAY_600}
                  textColor={themeStyle.WHITE_COLOR}
                  fontSize={16}
                />
              </View>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}
