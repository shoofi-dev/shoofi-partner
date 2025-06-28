import DropDownPicker from "react-native-dropdown-picker";
import { useEffect, useState } from "react";
import { View} from "react-native";
import themeStyle from "../../../styles/theme.style";

export type TProps = {
  itemsList: any;
  defaultValue: any;
  placeholder?: any;
  dropDownDirection?: any;
  disabled?:boolean;
  onChangeFn: (value: any) => void;
  onToggle?: (value: any) => void;
};
const DropDown = ({
  itemsList,
  defaultValue,
  onChangeFn,
  placeholder,
  onToggle,
  dropDownDirection = 'TOP',
  disabled
}: TProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState(itemsList);

  useEffect(()=>{
    onToggle && onToggle(open);
  },[open])
  const onSetValue = (value: any) => {
    setValue(value);
  };

  useEffect(() => {
    onChangeFn(value);
  }, [value]);

  return (
    <View style={{ flexDirection: "row" }}>
      <DropDownPicker
        open={open}
        value={(value)}
        items={items}
        setOpen={setOpen}
        setValue={onSetValue}
        setItems={setItems}
        placeholderStyle={{
          textAlign: "left",
          color: themeStyle.TEXT_PRIMARY_COLOR,
          fontSize:22
        }}
        disabled={disabled}
        labelStyle={{
          textAlign: "left",
          color: themeStyle.TEXT_PRIMARY_COLOR,
          fontSize:22

        }}
        style={{ flexDirection: "row", borderColor: themeStyle.PRIMARY_COLOR, opacity: disabled ? 0.5 : 1 }}
        listItemLabelStyle={{
          textAlign: "left",
          color: themeStyle.TEXT_PRIMARY_COLOR,
          fontSize:22

        }}
        dropDownContainerStyle={{ borderColor: themeStyle.PRIMARY_COLOR,
           backgroundColor: "rgba(254, 254, 254, 1)", maxHeight: "auto"
      }}
        itemSeparatorStyle={{ backgroundColor: themeStyle.PRIMARY_COLOR }}
        arrowIconStyle={{
          color: themeStyle.PRIMARY_COLOR,
          borderColor: themeStyle.PRIMARY_COLOR,
          fontSize:22

          
        }}
        ListModeType={"FLAT"}
        dropDownDirection={dropDownDirection}
        placeholder={placeholder}
        itemSeparator
 
        modalAnimationType={"slide"}
        // containerStyle={{}}
        // childrenContainerStyle={{
        //   justifyContent: 'flex-end',
        // }}
        // itemStyle={{justifyContent: 'flex-end', left:100}}
        // dropDownStyle={{backgroundColor: '#fafafa', height: 100}}
      />
    </View>
  );
};
export default DropDown;
