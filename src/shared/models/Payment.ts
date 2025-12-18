import { PlanType, SubscriptionStatus, TransactionType, TransactionStatus, TicketStatus } from '../types';

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  amount: number; // in paise
  currency: string;
  paymentMethod: string;
  razorpaySubscriptionId?: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  eventId?: string;
  subscriptionId?: string;
  type: TransactionType;
  amount: number; // in paise
  currency: string;
  status: TransactionStatus;
  paymentGatewayId: string;
  paymentMethod?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  registrationId: string;
  price: number; // in paise
  status: TicketStatus;
  purchasedAt: Date;
  qrCode: string;
  transactionId: string;
  
  // Populated fields
  event?: any; // Event interface
  user?: any; // User interface
}

export interface CreateSubscriptionRequest {
  planType: PlanType;
  paymentMethodId?: string;
  autoRenew?: boolean;
}

export interface CreateTicketPurchaseRequest {
  eventId: string;
  quantity: number;
  paymentMethodId?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  clientSecret: string;
  status: string;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // partial refund amount in paise
  reason: string;
}