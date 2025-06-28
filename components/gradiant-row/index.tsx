import { StyleSheet, View, Image } from "react-native";
import Counter from "../controls/counter";
import CheckBox from "../controls/checkbox";
import i18n from "../../translations/index-x";
import { getCurrentLang } from "../../translations/i18n";
import themeStyle from "../../styles/theme.style";
import Text from "../controls/Text";
import ImagePicker from "../controls/image-picker";
import { useTranslation } from "react-i18next";
import DropDown from "../controls/dropdown";
import { ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "../icon";

type TProps = {
  onChangeFn: any;
  icon?: any;
  type: any;
  title: any;
  value: any;
  stepValue?: number;
  minValue?: number;
  price?: number;
  hideIcon?: boolean;
  fontSize?: number;
  isMultipleChoice?: boolean;
  options?: any;
  placeholder?: string;
  onToggle?: any;
  dropDownDirection?: string;
  tasteList?: any;
  categoryId?: any;
  variant?: any;
  color?: any;
  isOneChoice?: any;
};

export default function GradiantRow({
  onChangeFn,
  icon,
  type,
  price,
  title,
  value,
  stepValue,
  minValue,
  hideIcon,
  fontSize,
  isMultipleChoice,
  options,
  placeholder,
  onToggle,
  dropDownDirection,
  tasteList,
  categoryId,
  variant,
  color,
  isOneChoice
}: TProps) {
  const { t } = useTranslation();

  const onChange = (value) => {
    onChangeFn(value);
  };

  const onPizzaExtraChange = (newValue) => {
    const index = value.indexOf(newValue);

    if (index === -1) {
      // Value does not exist, add it
      value.push(newValue);
    } else {
      // Value exists, remove it
      value.splice(index, 1);
    }

    onChangeFn(value);
  };

  const onTopChange = (newValue) => {
    onChangeFn(newValue === value ? null : newValue);
  };

  const getInputByType = (type, valuex, minValue, color) => {
    switch (type) {
      case "COUNTER":
        return (
          <Counter
            onCounterChange={onChange}
            value={valuex}
            stepValue={stepValue}
            minValue={minValue}
            variant={variant}
          />
        );
      case "CHOICE":
        return (
          <View style={{ paddingLeft: 8 }}>
            <CheckBox onChange={onChange} value={valuex} color={color}/>
          </View>
        );
    }
  };

  if (type === "CHOICE" && !isMultipleChoice) {
    return (
      <View style={{ paddingLeft: 8 }}>
        <CheckBox
          onChange={onChange}
          value={value}
          title={title}
          isOneChoice={isOneChoice}
          color={color}
        />
      </View>
    );
  }
  if (type === "uploadImage") {
    return (
      <View style={[styles.gradiantRow]}>
        <View
          style={[
            styles.textAndPriceContainer,
            // { marginLeft: 20, width: "25%" },
          ]}
        >
          <Text
            style={{
              fontSize: fontSize || 18,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.BROWN_700,
            }}
          >
            {title}
          </Text>
        </View>
        <View
          style={{
            width: "60%",
            alignItems: "center",
          }}
        >
          <ImagePicker handleImageSelect={onChange} />
        </View>
      </View>
    );
  }

  if (type === "oneChoice") {
    return (
      <View
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
          },
        ]}
      >
        <View style={[{ marginBottom: 10 }]}>
          <Text
            style={{
              fontSize: fontSize || 20,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.TEXT_PRIMARY_COLOR,
            }}
          >
            {t(title)}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              width: "100%",
            }}
          >
            {Object.keys(options).map((key) => (
              <CheckBox
                onChange={onChange}
                value={value}
                title={key}
                isOneChoice
                variant="button"
                isActive={value == key}

                // isDisabled={options[key].count === 0}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (type === "multiChoice") {
    return (
      <View style={[{}]}>
        {/* <View style={[styles.textAndPriceContainer, { marginBottom: 20, alignItems:'center', justifyContent:'center', paddingVertical:5, backgroundColor:'#FFCB05' }]}>
          <Text
            style={{
              fontSize: fontSize || 24,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: '#C31A21',
            }}
          >
            {t(title)}
          </Text>
        </View> */}
        <View
          style={{
            width: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {Object.keys(options).map((key) => {
              return (
                <View
                  style={{
                    // backgroundColor: value.includes(options[key].title) ? themeStyle.SUCCESS_COLOR : themeStyle.WHITE_COLOR,
                    // marginRight: 10,
                    // borderRadius: 20,
                    flexBasis: "100%",
                    paddingHorizontal: 20,
                    marginVertical: 10,
                  }}
                >
                  <CheckBox
                    onChange={onPizzaExtraChange}
                    value={value}
                    title={options[key].title}
                    isOneChoice
                    isActive={value.includes(options[key].title)}
                    // isDisabled={options[key].count === 0}
                  />

                  {/* <View>
                  <Text>{options[key].title}</Text>
                </View>*/}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  const onTasteChange = (tmpValue, key) => {
    const tmpTasteValue = { ...value, [key]: tmpValue };
    onChange(tmpTasteValue);
  };
  if (type === "dropDown") {
    const tmpOptions = tasteList.map((option) => {
      return {
        label: t(option.label),
        value: option.value,
      };
    });

    return (
      <View
        style={[
          styles.gradiantRow,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <View
          style={[
            styles.textAndPriceContainer,
            { marginLeft: 20, width: "20%" },
          ]}
        >
          <Text
            style={{
              fontSize: fontSize || 20,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: themeStyle.TEXT_PRIMARY_COLOR,
              left: -30,
            }}
          >
            {t(title)} :
          </Text>
        </View>
        <View
          style={{
            width: "50%",
            alignItems: "center",
            left: "-15%",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            {Object.keys(options).map((key) => {
              const placholdetTmp =
                categoryId == 5 || categoryId == 6
                  ? `${placeholder} ${t("level")} ${key}`
                  : placeholder;
              return (
                <View style={{ marginTop: 10 }}>
                  <DropDown
                    itemsList={tmpOptions}
                    defaultValue={value[key]}
                    onChangeFn={(e) => onTasteChange(e, key)}
                    placeholder={placholdetTmp}
                    onToggle={onToggle}
                    dropDownDirection={dropDownDirection}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.gradiantRow}>
      <View style={[styles.textAndPriceContainer, { width: "40%" }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && (
            <View style={{ marginRight: 5 }}>
              <Icon
                icon={icon}
                size={20}
                style={{
                  color: themeStyle.SECONDARY_COLOR,
                }}
              />
            </View>
          )}

          <Text
            style={{
              fontSize: fontSize || 18,
              fontFamily: `${getCurrentLang()}-SemiBold`,
              color: color,
            }}
          >
            {title}
          </Text>
        </View>
        {/* <View
          style={{
            marginHorizontal: -10,
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 5,
          }}
        >
          {price ? (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Rubik-Regular",
                color: themeStyle.BROWN_700,
              }}
            >
              {price}+
            </Text>
          ) : null}
          {price ? <Text>₪</Text> : null}
        </View> */}
      </View>
      <View style={styles.inputConatainer}>
        {getInputByType(type, value, minValue)}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  inputConatainer: {
    width: "30%",
    alignItems: "center",
  },
  gradiantRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  textAndPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    // borderRadius: 50,
  },
});
