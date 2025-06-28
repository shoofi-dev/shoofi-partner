import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import InputText from "../../components/controls/input";
import Button from "../../components/controls/button/button";
import themeStyle from "../../styles/theme.style";
import { AUTH_API, CUSTOMER_API } from "../../consts/api";
import { useState } from "react";
import * as Device from "expo-device";
import { useContext } from "react";
import { StoreContext } from "../../stores";
import base64 from "react-native-base64";
import { observer } from "mobx-react";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "../../utils/http-interceptor";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toBase64 } from "../../helpers/convert-base64";
import Text from "../../components/controls/Text";
import { LinearGradient } from "expo-linear-gradient";
import { _useDebounce } from "../../hooks/use-debounce";
import { ScrollView } from "react-native-gesture-handler";
import ConfirmActiondDialog from "../../components/dialogs/confirm-action";
import { getCurrentLang } from "../../translations/i18n";
import Icon from "../../components/icon";

const reg_arNumbers = /^[\u0660-\u0669]{10}$/;
const arabicNumbers = [
  /٠/g,
  /١/g,
  /٢/g,
  /٣/g,
  /٤/g,
  /٥/g,
  /٦/g,
  /٧/g,
  /٨/g,
  /٩/g,
];

const SearchCustomerScreen = () => {
  const { t } = useTranslation();
  const { adminCustomerStore, authStore } = useContext(StoreContext);

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState();
  const [customerList, setCustomerList] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [isOpenConfirmActiondDialog, setIsOpenConfirmActiondDialog] = useState(false);

  const debouncedSearch = _useDebounce(async () => {
    const customersRes = await adminCustomerStore.searchCustomer(searchQuery);
    setCustomerList(customersRes);
    setIsLoading(false)
  });

  const handleInputChange = (value) => {
    setIsLoading(true)
    setSearchQuery(value);
    if(value){
        debouncedSearch();
    }else{
        setTimeout(() => {
            setCustomerList(null);
        }, 500);
    }
  };

  const handleSelectCustomer = (customer) => {
    Keyboard.dismiss();
    adminCustomerStore.setCustomer(customer);
    setIsOpenConfirmActiondDialog(true);
  }
  const addNewCustomer = () => {
    navigation.navigate("login");
  }

  //   const isValidNunber = () => {
  //     return (
  //       phoneNumber?.match(/\d/g)?.length === 10 ||
  //       reg_arNumbers.test(phoneNumber)
  //     );
  //   };
  const ifUserBlocked = async () => {
    const userB = await AsyncStorage.getItem("@storage_user_b");
    const userBJson = JSON.parse(userB);
    if (userBJson) {
      return true;
    }
    return false;
  };

  const handleConfirmActionAnswer = (answer: string) => {
    if(answer){
        navigation.navigate("menuScreen");
    }
    setIsOpenConfirmActiondDialog(false);
  };

  const handleEditClick = (customer) =>{
    adminCustomerStore.setCustomer(customer);
    navigation.navigate("insert-customer-name", {name: customer.fullName});
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          marginTop: 15,
        }}
      >
        <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
          <View style={{flexBasis: '65%'}}>
          <InputText
          onChange={(e) => handleInputChange(e)}
          label={t("serch")}
          value={searchQuery}
          color={themeStyle.TEXT_PRIMARY_COLOR}
        />
          </View>
          <View style={{borderWidth:1, borderRadius:50, padding:10,flexBasis: 40, alignItems:'center'}}>
            <Text style={{fontSize:20,fontFamily:`${getCurrentLang()}-Bold`, color: themeStyle.TEXT_PRIMARY_COLOR}}>او</Text>
          </View>
          <View style={{flexBasis: '25%'}}>
          <Button
            text={t("add-new-customer")}
            icon="shopping-bag-plus"
            fontSize={17}
            onClickFn={addNewCustomer}
            textColor={themeStyle.TEXT_PRIMARY_COLOR}
            fontFamily={`${getCurrentLang()}-Bold`}
            borderRadious={19}
          />
          </View>
        </View>


        <ScrollView style={{marginTop:40}} keyboardShouldPersistTaps={'handled'}>
          {!isLoading && (!customerList || customerList.length === 0) && searchQuery && <View style={{alignSelf:'center', marginTop:40}}>
            <Text style={{fontSize:25, color: themeStyle.TEXT_PRIMARY_COLOR}}>
              {t('cannot-find-customer')}
            </Text>
          </View> }
          {isLoading && <View style={{alignSelf:'center', marginTop:40}}>
            <Text style={{fontSize:25, color: themeStyle.TEXT_PRIMARY_COLOR}}>
              <ActivityIndicator size="large"/>
            </Text>
          </View> }

        {!isLoading && customerList &&
          customerList.map((customer) => {
            return (
              <View  style={{ flexDirection: "row", borderBottomWidth: 1, padding: 15,justifyContent:'space-between', alignItems:'center', borderColor:themeStyle.SECONDARY_COLOR }}>
             <TouchableOpacity
               style={{flexDirection: "row",}}
                onPress={()=>handleSelectCustomer(customer)}
              >
                <Text style={{ fontSize: 25, color: themeStyle.TEXT_PRIMARY_COLOR }}>{customer.fullName}</Text>
                <Text style={{ fontSize: 25, color: themeStyle.TEXT_PRIMARY_COLOR }}>{"  -  "}</Text>
                <Text style={{ fontSize: 25, color: themeStyle.TEXT_PRIMARY_COLOR }} type="number">
                  {customer.phone}
                </Text>
              </TouchableOpacity>
              <View style={{}}>
              <TouchableOpacity
                      onPress={() =>
                        handleEditClick(customer)
                      }
                      style={{ padding: 15, zIndex: 2 }}
                    >
                      <Icon
                        icon="pencil"
                        size={18}
                        style={{
                          color: themeStyle.SECONDARY_COLOR,
                          marginRight: 10,
                        }}
                      />
                    </TouchableOpacity>
              </View>
              </View>
 
            );
          })}
        </ScrollView>
  
        {/* {!selectedProduct?.nameAR && (
          <Text style={{ color: themeStyle.ERROR_COLOR }}>
            {t("invalid-nameAR")}
          </Text>
        )} */}
      </View>
      <View style={styles.buttonContainer}>
        <View
          style={{
            width: "60%",
            alignSelf: "center",
            alignItems: "center",
          }}
        >
   
        </View>
      </View>
      <ConfirmActiondDialog
        handleAnswer={handleConfirmActionAnswer}
        isOpen={isOpenConfirmActiondDialog}
        text={'sure-continue'}
        positiveText="agree"
        negativeText="cancel"
      />
    </View>
  );
};
export default observer(SearchCustomerScreen);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  inputsContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 90,
  },
  footerTabs: {
    backgroundColor: "blue",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  background: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: "10%",
    bottom: "0%",
    borderRadius: 50,
  },
  buttonContainer: {
    width: "100%",
    // backgroundColor: "rgba(254, 254, 254, 0.9)",
    position:'absolute',
    bottom: 20,
    // marginTop: 60,
  },
});
