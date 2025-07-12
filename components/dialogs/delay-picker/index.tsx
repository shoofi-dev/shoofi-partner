import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCurrentLang } from '../../../translations/i18n';
import themeStyle from '../../../styles/theme.style';
import { useResponsive } from '../../../hooks/useResponsive';

interface DelayPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (delayMinutes: number) => void;
  currentDelay?: number;
}

const delayOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
];

const DelayPicker: React.FC<DelayPickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  currentDelay = 0,
}) => {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const [selectedDelay, setSelectedDelay] = useState(0);

  // Reset selected delay when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedDelay(0);
    }
  }, [isVisible]);

  const handleConfirm = () => {
    onConfirm(selectedDelay);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>اختر وقت التأخير</Text>
            <Text style={styles.subtitle}>بالدقائق</Text>
          </View>

          <View style={styles.optionsContainer}>
            {delayOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedDelay(option.value)}
                style={[
                  styles.optionButton,
                  selectedDelay === option.value && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDelay === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.actionButton, styles.confirmButton]}
              disabled={selectedDelay === 0}
            >
              <Text style={styles.confirmButtonText}>تأكيد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontFamily: `${getCurrentLang()}-Bold`,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontFamily: `${getCurrentLang()}-SemiBold`,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  optionButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: themeStyle.GRAY_300,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
    borderColor: themeStyle.SUCCESS_COLOR,
  },
  optionText: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontFamily: `${getCurrentLang()}-Bold`,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  selectedOptionText: {
    color: themeStyle.WHITE_COLOR,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: themeStyle.GRAY_300,
  },
  confirmButton: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
  },
  cancelButtonText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontFamily: `${getCurrentLang()}-Bold`,
    color: themeStyle.WHITE_COLOR,
  },
  confirmButtonText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontFamily: `${getCurrentLang()}-Bold`,
    color: themeStyle.WHITE_COLOR,
  },
});

export default DelayPicker; 