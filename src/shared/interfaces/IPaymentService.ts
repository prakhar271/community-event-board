import { Subscription, Transaction, Ticket, CreateSubscriptionRequest, CreateTicketPurchaseRequest, PaymentIntent, RefundRequest } from '../models/Payment';
import { PlanType } from '../types';

export interface IPaymentService {
  // Subscription management
  createSubscription(userId: string, subscriptionData: CreateSubscriptionRequest): Promise<{ subscription: Subscription; paymentIntent?: PaymentIntent }>;
  getSubscription(userId: string): Promise<Subscription | null>;
  updateSubscription(userId: string, planType: PlanType): Promise<Subscription>;
  cancelSubscription(userId: string): Promise<Subscription>;
  renewSubscription(subscriptionId: string): Promise<Subscription>;
  
  // Ticket sales
  purchaseTickets(userId: string, purchaseData: CreateTicketPurchaseRequest): Promise<{ tickets: Ticket[]; paymentIntent: PaymentIntent }>;
  getTicket(ticketId: string): Promise<Ticket | null>;
  getUserTickets(userId: string): Promise<Ticket[]>;
  validateTicket(ticketId: string, qrCode: string): Promise<boolean>;
  
  // Transaction management
  getTransaction(transactionId: string): Promise<Transaction | null>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  processRefund(refundData: RefundRequest): Promise<Transaction>;
  
  // Payment processing
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<Transaction>;
  handleWebhook(payload: any, signature: string): Promise<void>;
  
  // Revenue and analytics
  getOrganizerRevenue(organizerId: string, startDate?: Date, endDate?: Date): Promise<any>;
  getPlatformRevenue(startDate?: Date, endDate?: Date): Promise<any>;
  
  // Plan validation
  validatePlanLimits(userId: string, action: 'create_event' | 'add_attendee'): Promise<boolean>;
  getPlanFeatures(planType: PlanType): Promise<any>;
  
  // Razorpay integration
  createRazorpayOrder(amount: number, currency: string, metadata?: any): Promise<any>;
  verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): Promise<boolean>;
}