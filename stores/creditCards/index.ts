import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";

export interface CreditCard {
  _id: string;
  customerId: string;
  ccToken: string;
  last4Digits: string;
  ccType: string;
  holderName: string;
  isDefault: boolean;
  isActive: boolean;
  created: string;
  updated: string;
}

class CreditCardsStore {
  creditCards: CreditCard[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Fetch customer's credit cards
  async fetchCreditCards(): Promise<CreditCard[]> {
    this.loading = true;
    this.error = null;
    
    try {
      const response: any = await axiosInstance.get('/credit-cards');
      
      runInAction(() => {
        this.creditCards = response;
        this.loading = false;
      });

      return response;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Add new credit card
  async addCreditCard(creditCardData: {
    ccToken: string;
    last4Digits: string;
    ccType: string;
    holderName: string;
    isDefault?: boolean;
  }): Promise<string> {
    this.loading = true;
    this.error = null;

    try {
      const response: any = await axiosInstance.post('/credit-cards', creditCardData);
      
      // Refresh the list
      await this.fetchCreditCards();
      
      runInAction(() => {
        this.loading = false;
      });

      return response.creditCardId;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Update credit card
  async updateCreditCard(cardId: string, updateData: {
    holderName?: string;
    isDefault?: boolean;
  }): Promise<void> {
    this.loading = true;
    this.error = null;
    
    try {
      await axiosInstance.put(`/credit-cards/${cardId}`, updateData);
      
      // Refresh the list
      await this.fetchCreditCards();
      
      runInAction(() => {
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Delete credit card
  async deleteCreditCard(cardId: string): Promise<void> {
    this.loading = true;
    this.error = null;
    
    try {
      await axiosInstance.delete(`/credit-cards/${cardId}`);
      
      // Refresh the list
      await this.fetchCreditCards();
      
      runInAction(() => {
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Set default credit card
  async setDefaultCreditCard(cardId: string): Promise<void> {
    this.loading = true;
    this.error = null;
    
    try {
      await axiosInstance.patch(`/credit-cards/${cardId}/default`);
      
      // Refresh the list
      await this.fetchCreditCards();
      
      runInAction(() => {
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Get default credit card
  get defaultCreditCard(): CreditCard | null {
    return this.creditCards.find(card => card.isDefault) || null;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

  // Reset store
  reset() {
    this.creditCards = [];
    this.loading = false;
    this.error = null;
  }
}

export const creditCardsStore = new CreditCardsStore();
export { CreditCardsStore }; 