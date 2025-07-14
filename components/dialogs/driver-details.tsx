import { View, TouchableOpacity, Linking } from "react-native";
import { Dialog, Portal, Provider } from "react-native-paper";
import Text from "../controls/Text";
import { useState, useEffect } from "react";
import themeStyle from "../../styles/theme.style";
import { useTranslation } from "react-i18next";
import Icon from "../icon";
import DialogBG from "./dialog-bg";
import { useResponsive } from "../../hooks/useResponsive";

type DriverDetails = {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  isActive: boolean;
  companyId: string;
  companyName?: string;
  vehicleInfo?: {
    type: string;
    model: string;
    plateNumber: string;
  };
  rating?: number;
  totalDeliveries?: number;
  totalEarnings?: number;
  createdAt: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  isOnline?: boolean;
  isAvailable?: boolean;
  role?: string;
};

type TProps = {
  isOpen: boolean;
  driverDetails: DriverDetails | null;
  handleAnswer?: (value: boolean) => void;
};

export default function DriverDetailsDialog({
  isOpen,
  driverDetails,
  handleAnswer,
}: TProps) {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const hideDialog = (value: boolean) => {
    handleAnswer && handleAnswer(value);
    setVisible(false);
  };

  const handleCallDriver = () => {
    if (driverDetails?.phone) {
      Linking.openURL(`tel:${driverDetails.phone}`);
    }
  };

  const handleOpenWaze = () => {
    if (driverDetails?.currentLocation?.latitude && driverDetails?.currentLocation?.longitude) {
      const url = `https://waze.com/ul?ll=${driverDetails.currentLocation.latitude},${driverDetails.currentLocation.longitude}&navigate=yes`;
      Linking.openURL(url);
    }
  };

  const getStatusText = (isActive: boolean, isOnline: boolean) => {
    if (!isActive) return "غير نشط";
    if (isOnline) return "متصل";
    return "غير متصل";
  };

  const getStatusColor = (isActive: boolean, isOnline: boolean) => {
    if (!isActive) return themeStyle.ERROR_COLOR;
    if (isOnline) return themeStyle.SUCCESS_COLOR;
    return themeStyle.WARNING_COLOR;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Provider>
      <Portal>
        <Dialog
          theme={{
            colors: {},
          }}
          style={{
            maxWidth: isTablet ? 600 : "90%",
            alignSelf: "center",
          }}
          visible={visible}
          dismissable={true}
          onDismiss={() => hideDialog(false)}
        >
          <DialogBG>
            <Dialog.Content>
              <View style={{ margin: 20 }}>
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      icon="delivery-active"
                      size={isTablet ? 40 : 30}
                      style={{ color: themeStyle.SECONDARY_COLOR, marginRight: 10 }}
                    />
                    <Text style={{ fontSize: isTablet ? 24 : 20, fontFamily: "ar-Bold", color: themeStyle.TEXT_PRIMARY_COLOR }}>
                      تفاصيل السائق
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => hideDialog(false)} style={{ padding: 5 }}>
                    <Icon icon="close" size={24} style={{ color: themeStyle.SUCCESS_COLOR }} />
                  </TouchableOpacity>
                </View>

                {driverDetails ? (
                  <View>
                    {/* Driver Basic Info */}
                    <View style={{ backgroundColor: themeStyle.WHITE_COLOR, borderRadius: 12, padding: 15, marginBottom: 15 }}>
                      
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: isTablet ? 16 : 14, fontFamily: "ar-SemiBold" }}>
                          الاسم:
                        </Text>
                        <Text style={{ fontSize: isTablet ? 16 : 14, fontFamily: "ar-Bold", color: themeStyle.TEXT_PRIMARY_COLOR }}>
                          {driverDetails.fullName}
                        </Text>
                      </View>

                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: isTablet ? 16 : 14, fontFamily: "ar-SemiBold" }}>
                          رقم الهاتف:
                        </Text>
                        <TouchableOpacity onPress={handleCallDriver} style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={{ fontSize: isTablet ? 16 : 14, fontFamily: "ar-Bold", color: themeStyle.SUCCESS_COLOR, marginRight: 8 }}>
                            {driverDetails.phone}
                          </Text>
                          <Icon icon="phone" size={20} style={{ color: themeStyle.SUCCESS_COLOR }} />
                        </TouchableOpacity>
                      </View>

            

                      {/* <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: isTablet ? 16 : 14, fontFamily: "ar-SemiBold", color: themeStyle.GRAY_600 }}>
                          الحالة:
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: 6, 
                            backgroundColor: getStatusColor(driverDetails.isActive, driverDetails.isOnline),
                            marginRight: 8 
                          }} />
                          <Text style={{ 
                            fontSize: isTablet ? 16 : 14, 
                            fontFamily: "ar-Bold", 
                            color: getStatusColor(driverDetails.isActive, driverDetails.isOnline) 
                          }}>
                            {getStatusText(driverDetails.isActive, driverDetails.isOnline)}
                          </Text>
                        </View>
                      </View> */}

                    </View>

       
                  </View>
                ) : (
                  <View style={{ alignItems: "center", padding: 40 }}>
                    {/* <Icon icon="delivery-active" size={60} style={{ color: themeStyle.GRAY_400, marginBottom: 20 }} />
                    <Text style={{ fontSize: isTablet ? 18 : 16, fontFamily: "ar-Bold", color: themeStyle.GRAY_600, textAlign: "center" }}>
                      لا توجد معلومات متاحة للسائق
                    </Text> */}
                  </View>
                )}

                {/* Close Button */}
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <TouchableOpacity 
                    onPress={() => hideDialog(false)}
                    style={{
                      backgroundColor: themeStyle.SECONDARY_COLOR,
                      paddingHorizontal: 30,
                      paddingVertical: 12,
                      borderRadius: 25,
                      minWidth: 120,
                      alignItems: "center"
                    }}
                  >
                    <Text style={{ 
                      fontSize: isTablet ? 16 : 14, 
                      fontFamily: "ar-Bold", 
                      color: themeStyle.WHITE_COLOR 
                    }}>
                      إغلاق
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Dialog.Content>
          </DialogBG>
        </Dialog>
      </Portal>
    </Provider>
  );
} 