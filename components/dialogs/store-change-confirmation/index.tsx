import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../controls/Text';
import Button from '../../controls/button/button';
import themeStyle from '../../../styles/theme.style';

interface StoreChangeConfirmationDialogProps {
  isOpen: boolean;
  onApprove: () => void;
  onCancel: () => void;
}

const StoreChangeConfirmationDialog: React.FC<StoreChangeConfirmationDialogProps> = ({
  isOpen,
  onApprove,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>New Store Selected</Text>
        <Text style={styles.message}>
          You are choosing a new store. This will reset your current cart. Would you like to continue?
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            text="Cancel"
            onClickFn={onCancel}
            variant="gray"
            style={styles.button}
          />
          <View style={styles.buttonSeparator} /> 
          <Button
            text="Continue"
            onClickFn={onApprove}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: themeStyle.PRIMARY_COLOR,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: themeStyle.GRAY_700,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '50%',
    alignItems:'center',
    marginLeft: -5
  },
  buttonSeparator: {
    width: 10,
  },
  button: {
    flex: 1,
  },
});

export default StoreChangeConfirmationDialog; 