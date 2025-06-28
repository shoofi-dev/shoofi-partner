import { StyleSheet, DeviceEventEmitter, Keyboard } from "react-native";
import { useState, useCallback, useEffect } from "react";
import theme from "../../styles/theme.style";
import MonthPicker from "react-native-month-year-picker";
import moment from "moment";
import { useTranslation } from "react-i18next";

const ExpiryDate = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    DeviceEventEmitter.addListener(`SHOW_EXP_DATE_PICKER`, showPicker);
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      showPicker(false);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {});

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const showPicker = useCallback((value) => {
    console.log("showPicker", value.show);
    setShow(value.show);
  }, []);

  const onValueChange = useCallback(
    (event, newDate) => {
      const selectedDate = newDate || date;

      showPicker(false);
      setDate(selectedDate);
      DeviceEventEmitter.emit(`EXP_DATE_PICKER_CHANGE`, {
        expDate: moment(selectedDate).format("MM/YY"),
      });

      //   setCreditCardExpDate(moment(selectedDate).format("MM/YY"));
    },
    [date, showPicker]
  );
    const currentYear = new Date().getFullYear();
  if (show) {
    return (
      <MonthPicker
        onChange={onValueChange}
        value={date}
        mode="number"
        minimumDate={new Date()}
        maximumDate={new Date(currentYear + 10, 11)}
        okButton={t('approve')}
        cancelButton={t('cancel')}
        autoTheme
      />
    );
  }
};

export default ExpiryDate;

const styles = StyleSheet.create({
  container: {},
  monthExpContainer: { marginTop: 10 },
  monthExpContainerChild: {},
  submitButton: {
    backgroundColor: theme.SUCCESS_COLOR,
    borderRadius: 15,
    marginTop: 30,
  },
  submitContentButton: {
    height: 50,
  },
});
