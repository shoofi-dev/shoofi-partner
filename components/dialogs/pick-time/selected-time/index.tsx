import { View } from "react-native";
import Text from "../../../controls/Text";
import Icon from "../../../icon";
import themeStyle from "../../../../styles/theme.style";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getCurrentLang } from "../../../../translations/i18n";

export type TProps = {
    selectedTime?: any
}
export default function SelectedTimeCMP({selectedTime}: TProps) {
  const { t } = useTranslation();

    return(
        <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ marginBottom: 5 }}>
          <Text style={{ fontSize: 20,color: themeStyle.SECONDARY_COLOR, }}>{t("picked-time")}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon
            icon="calendar"
            size={18}
            style={{
              color: themeStyle.SECONDARY_COLOR,
              marginRight: 5,
            }}
          />
          <Text type="number" style={{ fontSize: 20,color: themeStyle.SECONDARY_COLOR, }}>
          {moment(selectedTime).locale(getCurrentLang()).format("dddd")} - {moment(selectedTime).format("DD/MM/YYYY - HH:mm")}

          </Text>
        </View>
      </View>
    );
};