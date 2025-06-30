export type TProps = {
  onReplaceCreditCard: any;
  ccData: any;
  shippingMethod: any;
};
export const CCDataCMP = ({
  onReplaceCreditCard,
  ccData,
  shippingMethod,
}: TProps) => {
  const { t } = useTranslation();

  const replaceCreditCard = () => {
    // Navigate to credit cards list instead of just replacing
    onReplaceCreditCard();
  };

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#F6F8FA",
        borderRadius: 4,
        padding: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            icon={ccData?.ccType}
            size={40}
            style={{ color: theme.GRAY_700, marginLeft: 10, marginRight: 10 }}
          />
         

          <Text
            style={{
              fontSize: 17,
              color: themeStyle.TEXT_PRIMARY_COLOR,
              fontFamily: `${getCurrentLang()}-Bold`,
            }}
          >{`**** **** **** ${ccData?.last4Digits}`}</Text>
        
   
        </View>
        <TouchableOpacity onPress={replaceCreditCard} style={{marginRight: 15}}>
          <Text
            style={{
              fontSize: 16,
              color: themeStyle.TEXT_PRIMARY_COLOR,
            }}
          >
            {'<'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 