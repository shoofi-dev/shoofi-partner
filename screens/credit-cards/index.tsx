import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { observer } from 'mobx-react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StoreContext } from '../../stores';
import { CreditCard } from '../../stores/creditCards';
import Text from '../../components/controls/Text';
import Icon from '../../components/icon';
import BackButton from '../../components/back-button';
import Button from '../../components/controls/button/button';
import themeStyle from '../../styles/theme.style';
import { useResponsive } from '../../hooks/useResponsive';
import { DIALOG_EVENTS } from '../../consts/events';
import NewPaymentMethodBasedEventDialog from '../../components/dialogs/new-credit-card-based-event';

const CreditCardsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { creditCardsStore } = useContext(StoreContext);
  const { scale, fontSize } = useResponsive();
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    try {
      await creditCardsStore.fetchCreditCards();
    } catch (error) {
      console.error('Failed to load credit cards:', error);
    }
  };

  const handleAddCard = () => {
    DeviceEventEmitter.emit(
        DIALOG_EVENTS.OPEN_NEW_CREDIT_CARD_BASED_EVENT_DIALOG
      );    
  };

  const handleEditCard = (card: CreditCard) => {
    navigation.navigate('edit-credit-card', { card });
  };

  const handleDeleteCard = (card: CreditCard) => {
    Alert.alert(
      t('delete-credit-card'),
      t('delete-credit-card-confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await creditCardsStore.deleteCreditCard(card._id);
              Alert.alert(t('success'), t('credit-card-deleted'));
            } catch (error) {
              Alert.alert(t('error'), t('failed-to-delete-credit-card'));
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (card: CreditCard) => {
    try {
      await creditCardsStore.setDefaultCreditCard(card._id);
      Alert.alert(t('success'), t('default-credit-card-updated'));
    } catch (error) {
      Alert.alert(t('error'), t('failed-to-update-default-card'));
    }
  };

  const renderCreditCard = (card: CreditCard) => (
    <View key={card._id} style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Icon
            icon={card.ccType}
            size={40}
            style={styles.cardIcon}
          />
          <View style={styles.cardDetails}>
            <Text style={styles.cardNumber}>
              **** **** **** {card.last4Digits}
            </Text>
            <Text style={styles.cardHolder}>
              {card.holderName}
            </Text>
            {card.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>{t('default')}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.cardActions}>
          {!card.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(card)}
            >
              <Icon icon="star" size={20} style={styles.actionIcon} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCard(card)}
          >
            <Icon icon="pencil" size={20} style={styles.actionIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCard(card)}
          >
            <Icon icon="trash" size={20} style={[styles.actionIcon, styles.deleteIcon]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>{t('credit-cards')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {creditCardsStore.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeStyle.PRIMARY_COLOR} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : creditCardsStore.creditCards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon icon="credit-card" size={80} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>{t('no-credit-cards')}</Text>
            <Text style={styles.emptySubtitle}>{t('add-your-first-credit-card')}</Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {creditCardsStore.creditCards.map(renderCreditCard)}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onClickFn={handleAddCard}
          text={t('add-credit-card')}
          fontSize={fontSize(18)}
          textColor={themeStyle.WHITE_COLOR}
          borderRadious={50}
          textPadding={0}
        />
      </View>
      <NewPaymentMethodBasedEventDialog />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.WHITE_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.GRAY_600,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    color: themeStyle.GRAY_600,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: themeStyle.GRAY_600,
    textAlign: 'center',
  },
  cardsList: {
    paddingVertical: 20,
  },
  cardContainer: {
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: themeStyle.BLACK_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_600,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    color: themeStyle.GRAY_700,
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginBottom: 5,
  },
  cardHolder: {
    fontSize: 14,
    color: themeStyle.GRAY_600,
    marginBottom: 5,
  },
  defaultBadge: {
    backgroundColor: themeStyle.SUCCESS_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 12,
    color: themeStyle.WHITE_COLOR,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  actionIcon: {
    color: themeStyle.PRIMARY_COLOR,
  },
  deleteIcon: {
    color: themeStyle.ERROR_COLOR,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: themeStyle.GRAY_600,
  },
});

export default observer(CreditCardsScreen); 