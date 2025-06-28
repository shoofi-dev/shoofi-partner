import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StoreContext } from '../../stores';
import validateCard, { TValidateCardProps, TCCDetails } from './api/validate-card';
import cardValidator from 'card-validator';
import isValidID from '../../helpers/validate-id-number';
import Button from '../controls/button/button';
import themeStyle from '../../styles/theme.style';
import ExpiryDate from '../expiry-date';
import DeviceEventEmitter from 'react-native';

interface AddCreditCardProps {
  onCardAdded?: (cardData: TCCDetails) => void;
  isDefault?: boolean;
}

const AddCreditCard: React.FC<AddCreditCardProps> = ({ onCardAdded, isDefault = false }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { creditCardsStore, userDetailsStore } = useContext(StoreContext);

  const [creditCardNumber, setCreditCardNumber] = useState('');
  const [creditCardExpDate, setCreditCardExpDate] = useState('');
  const [creditCardCVV, setCreditCardCVV] = useState('');
  const [cardHolderID, setCardHolderID] = useState('');
  const [ccType, setCCType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formStatus, setFormStatus] = useState({
    isNumberValid: undefined,
    isCVVValid: undefined,
    idIDValid: undefined,
  });
  const [isExpDateValid, setIsExpDateValid] = useState(undefined);

  React.useEffect(() => {
    const ExpDatePickerChange = DeviceEventEmitter.addListener(
      `EXP_DATE_PICKER_CHANGE`,
      setExpData.bind(this)
    );
    return () => {
      ExpDatePickerChange.remove();
    };
  }, []);

  const setExpData = (data: any) => {
    const validation: any = cardValidator.expirationDate(data.expDate);
    setCreditCardExpDate(data.expDate);
    setIsExpDateValid(validation?.isValid);
  };

  const showPicker = () => {
    DeviceEventEmitter.emit(`SHOW_EXP_DATE_PICKER`, { show: true });
  };

  const onNumberChange = (value: string) => {
    const { isValid, card }: any = cardValidator.number(value);
    if (isValid) {
      setCCType(card?.type);
    }
    setCreditCardNumber(value);
    setFormStatus({ ...formStatus, isNumberValid: isValid });
  };

  const onCVVChange = (value: string) => {
    const { isValid } = cardValidator.cvv(value);
    setCreditCardCVV(value);
    setFormStatus({ ...formStatus, isCVVValid: isValid });
  };

  const onCardHolderNameChange = (value: string) => {
    const isValid: any = isValidID(value);
    setCardHolderID(value);
    setFormStatus({ ...formStatus, idIDValid: isValid });
  };

  const isFormValid = () => {
    return !(
      formStatus.idIDValid &&
      formStatus.isCVVValid &&
      isExpDateValid &&
      formStatus.isNumberValid
    );
  };

  const onSaveCreditCard = async () => {
    if (!creditCardNumber || !creditCardExpDate || !cardHolderID) {
      Alert.alert(t('error'), t('please-fill-all-fields'));
      return;
    }

    setIsLoading(true);
    
    try {
      const validateCardData: TValidateCardProps = {
        cardNumber: creditCardNumber,
        expDate: creditCardExpDate.replace("/", ""),
      };

      const res = await validateCard(validateCardData);
      
      if (res.isValid) {
        const ccData: TCCDetails = {
          ccToken: res.ccDetails.ccToken,
          last4Digits: res.ccDetails.last4Digits,
          ccType: ccType,
          id: cardHolderID,
          cvv: creditCardCVV,
        };

        // Save to database
        await creditCardsStore.addCreditCard({
          ccToken: ccData.ccToken,
          last4Digits: ccData.last4Digits,
          ccType: ccData.ccType,
          holderName: userDetailsStore.userDetails?.name || 'Card Holder',
          isDefault: isDefault,
        });

        Alert.alert(t('success'), t('credit-card-added-successfully'));
        
        if (onCardAdded) {
          onCardAdded(ccData);
        }
        
        navigation.goBack();
      } else {
        Alert.alert(t('error'), t('invalid-credit-card'));
      }
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failed-to-add-credit-card'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('add-credit-card')}</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('credit-card-number')}</Text>
          <TextInput
            style={[
              styles.input,
              formStatus.isNumberValid === false && styles.inputError
            ]}
            value={creditCardNumber}
            onChangeText={onNumberChange}
            placeholder="1234 1234 1234 1234"
            keyboardType="numeric"
            maxLength={19}
          />
          {formStatus.isNumberValid === false && (
            <Text style={styles.errorText}>{t('invalid-cc-number')}</Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>{t('expiry-date')}</Text>
            <TouchableOpacity
              style={[
                styles.input,
                isExpDateValid === false && styles.inputError
              ]}
              onPress={showPicker}
            >
              <Text style={styles.dateText}>
                {creditCardExpDate || t('select-date')}
              </Text>
            </TouchableOpacity>
            {isExpDateValid === false && (
              <Text style={styles.errorText}>{t('invalid-expiry-date')}</Text>
            )}
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={[
                styles.input,
                formStatus.isCVVValid === false && styles.inputError
              ]}
              value={creditCardCVV}
              onChangeText={onCVVChange}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
            />
            {formStatus.isCVVValid === false && (
              <Text style={styles.errorText}>{t('invalid-cvv')}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('id-number')}</Text>
          <TextInput
            style={[
              styles.input,
              formStatus.idIDValid === false && styles.inputError
            ]}
            value={cardHolderID}
            onChangeText={onCardHolderNameChange}
            placeholder={t('enter-id-number')}
            keyboardType="numeric"
          />
          {formStatus.idIDValid === false && (
            <Text style={styles.errorText}>{t('invalid-id-number')}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onClickFn={onSaveCreditCard}
            disabled={isFormValid() || isLoading}
            text={isLoading ? t('saving') : t('save-credit-card')}
            fontSize={18}
            textColor={themeStyle.WHITE_COLOR}
            isLoading={isLoading}
            borderRadious={50}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: themeStyle.GRAY_600,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  inputError: {
    borderColor: themeStyle.ERROR_COLOR,
  },
  errorText: {
    color: themeStyle.ERROR_COLOR,
    fontSize: 12,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  dateText: {
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  buttonContainer: {
    marginTop: 30,
  },
});

export default AddCreditCard; 