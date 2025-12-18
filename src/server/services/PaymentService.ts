import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { IPaymentService } from '../../shared/interfaces/IPaymentService';
import { Subscription, Transaction, Ticket, CreateSubscriptionRequest, CreateTicketPurchaseRequest, PaymentIntent, RefundRequest } from '../../shared/models/Payment';
import { PlanType, PLAN_FEATURES, SubscriptionStatus, TransactionType, TransactionStatus, TicketStatus } from '../../shared/types';
import { SubscriptionModel, TransactionModel, TicketModel } from '../models/PaymentModels';
import { EventRepository } from '../repositories/EventRepository';

export class PaymentService implements IPaymentService {
  private razorpay: Razorpay;

  constructor(private eventRepository: EventRepository) {
    // Initialize Razorpay only if proper credentials are provided
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (keyId && keySecret && keyId !== 'rzp_test_placeholder_key_id' && keySecret !== 'placeholder_key_secret') {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } else {
      console.warn('⚠️  Razorpay credentials not configured. Payment features will be mocked in development mode.');
      // Create a mock Razorpay instance for development
      this.razorpay = {
        subscriptions: {
          create: async (data: any) => ({ id: 'mock_sub_' + Date.now(), ...data }),
          cancel: async (id: string) => ({ id, status: 'cancelled' })
        },
        orders: {
          create: async (data: any) => ({ id: 'mock_order_' + Date.now(), ...data })
        },
        payments: {
          refund: async (id: string, data: any) => ({ id: 'mock_refund_' + Date.now(), payment_id: id, ...data })
        }
      } as any;
    }
  }

  async createSubscription(userId: string, subscriptionData: CreateSubscriptionRequest): Promise<{ subscription: Subscription; paymentIntent?: PaymentIntent }> {
    const planFeatures = PLAN_FEATURES[subscriptionData.planType];
    
    if (!planFeatures.price) {
      // Free plan
      const subscription = new SubscriptionModel({
        id: uuidv4(),
        userId,
        planType: subscriptionData.planType,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        amount: 0,
        currency: 'INR',
        paymentMethod: 'free',
        autoRenew: false
      });

      // Save to database (would be implemented with repository)
      return { subscription };
    }

    // Paid plan
    const razorpaySubscription = await this.razorpay.subscriptions.create({
      plan_id: this.getPlanId(subscriptionData.planType),
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      notes: {
        userId,
        planType: subscriptionData.planType
      }
    });

    const subscription = new SubscriptionModel({
      id: uuidv4(),
      userId,
      planType: subscriptionData.planType,
      status: SubscriptionStatus.PENDING,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amount: planFeatures.price,
      currency: 'INR',
      paymentMethod: 'razorpay',
      razorpaySubscriptionId: razorpaySubscription.id,
      autoRenew: subscriptionData.autoRenew !== false
    });

    return { subscription };
  }

  async getSubscription(_userId: string): Promise<Subscription | null> {
    // This would be implemented with repository
    return null;
  }

  async updateSubscription(userId: string, planType: PlanType): Promise<Subscription> {
    // Get current subscription
    const currentSubscription = await this.getSubscription(userId);
    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }

    const planFeatures = PLAN_FEATURES[planType];
    
    if (!planFeatures.price) {
      // Downgrading to free plan
      const updatedSubscription = new SubscriptionModel({
        ...currentSubscription,
        planType,
        status: SubscriptionStatus.ACTIVE,
        amount: 0,
        paymentMethod: 'free',
        autoRenew: false,
        updatedAt: new Date()
      });

      // Cancel existing Razorpay subscription if exists
      if (currentSubscription.razorpaySubscriptionId) {
        try {
          await this.razorpay.subscriptions.cancel(currentSubscription.razorpaySubscriptionId);
        } catch (error) {
          console.error('Failed to cancel Razorpay subscription:', error);
        }
      }

      return updatedSubscription;
    }

    // Upgrading to paid plan
    const razorpaySubscription = await this.razorpay.subscriptions.create({
      plan_id: this.getPlanId(planType),
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      notes: {
        userId,
        planType,
        upgrade: 'true'
      }
    });

    const updatedSubscription = new SubscriptionModel({
      ...currentSubscription,
      planType,
      status: SubscriptionStatus.PENDING,
      amount: planFeatures.price,
      paymentMethod: 'razorpay',
      razorpaySubscriptionId: razorpaySubscription.id,
      updatedAt: new Date()
    });

    return updatedSubscription;
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // Cancel Razorpay subscription if exists
    if (subscription.razorpaySubscriptionId) {
      try {
        await this.razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
      } catch (error) {
        console.error('Failed to cancel Razorpay subscription:', error);
      }
    }

    // Update subscription status
    const cancelledSubscription = new SubscriptionModel({
      ...subscription,
      status: SubscriptionStatus.CANCELLED,
      autoRenew: false,
      updatedAt: new Date()
    });

    return cancelledSubscription;
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    // This would typically be called by webhook or scheduled job
    // Get subscription by ID (would need repository method)
    
    // For now, create a basic renewal implementation
    const renewedSubscription = new SubscriptionModel({
      id: subscriptionId,
      userId: '', // Would be fetched from database
      planType: PlanType.FREE, // Would be fetched from database
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amount: 0,
      currency: 'INR',
      paymentMethod: 'razorpay',
      autoRenew: true,
      updatedAt: new Date()
    });

    return renewedSubscription;
  }

  async purchaseTickets(userId: string, purchaseData: CreateTicketPurchaseRequest): Promise<{ tickets: Ticket[]; paymentIntent: PaymentIntent }> {
    // Get event details to determine price
    const event = await this.eventRepository.findById(purchaseData.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const eventPrice = event.isPaid ? (event.ticketPrice || 0) : 0;
    const totalAmount = eventPrice * purchaseData.quantity;

    // Create Razorpay order
    const order = await this.razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      notes: {
        userId,
        eventId: purchaseData.eventId,
        quantity: purchaseData.quantity
      }
    });

    const paymentIntent: PaymentIntent = {
      id: order.id,
      amount: totalAmount,
      currency: 'INR',
      clientSecret: order.id, // In Razorpay, order ID is used
      status: 'requires_payment_method'
    };

    // Create tickets (will be activated after payment confirmation)
    const tickets: Ticket[] = [];
    for (let i = 0; i < purchaseData.quantity; i++) {
      const ticketId = uuidv4();
      const qrCode = await QRCode.toDataURL(`ticket:${ticketId}`);
      
      const ticket = new TicketModel({
        id: ticketId,
        eventId: purchaseData.eventId,
        userId,
        registrationId: '', // Would be set after registration
        price: eventPrice,
        status: TicketStatus.ACTIVE,
        purchasedAt: new Date(),
        qrCode,
        transactionId: order.id
      });

      tickets.push(ticket);
    }

    return { tickets, paymentIntent };
  }

  async getTicket(_ticketId: string): Promise<Ticket | null> {
    // This would be implemented with repository
    return null;
  }

  async getUserTickets(_userId: string): Promise<Ticket[]> {
    // This would be implemented with repository
    return [];
  }

  async validateTicket(_ticketId: string, _qrCode: string): Promise<boolean> {
    // This would validate the ticket against the database
    return false;
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    // This would be implemented with repository
    return null;
  }

  async getUserTransactions(_userId: string): Promise<Transaction[]> {
    // This would be implemented with repository
    return [];
  }

  async processRefund(refundData: RefundRequest): Promise<Transaction> {
    // Get original transaction
    const originalTransaction = await this.getTransaction(refundData.transactionId);
    if (!originalTransaction) {
      throw new Error('Transaction not found');
    }

    const refundAmount = refundData.amount || originalTransaction.amount;

    // Process refund with Razorpay
    const refund = await this.razorpay.payments.refund(originalTransaction.paymentGatewayId, {
      amount: refundAmount,
      notes: {
        reason: refundData.reason
      }
    });

    // Create refund transaction
    const refundTransaction = new TransactionModel({
      id: uuidv4(),
      userId: originalTransaction.userId,
      eventId: originalTransaction.eventId,
      type: TransactionType.REFUND,
      amount: -refundAmount,
      currency: originalTransaction.currency,
      status: TransactionStatus.COMPLETED,
      paymentGatewayId: refund.id,
      metadata: {
        originalTransactionId: refundData.transactionId,
        reason: refundData.reason
      }
    });

    return refundTransaction;
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent> {
    const order = await this.razorpay.orders.create({
      amount,
      currency,
      notes: metadata
    });

    return {
      id: order.id,
      amount,
      currency,
      clientSecret: order.id,
      status: 'requires_payment_method'
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<Transaction> {
    // This would be called after successful payment
    // Create transaction record
    const transaction = new TransactionModel({
      id: uuidv4(),
      userId: '', // Would be extracted from payment intent
      type: TransactionType.TICKET,
      amount: 0, // Would be extracted from payment intent
      currency: 'INR',
      status: TransactionStatus.COMPLETED,
      paymentGatewayId: paymentIntentId,
      completedAt: new Date()
    });

    return transaction;
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload.payload.payment.entity);
        break;
      case 'subscription.charged':
        await this.handleSubscriptionCharged(payload.payload.subscription.entity);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload.payload.payment.entity);
        break;
    }
  }

  async getOrganizerRevenue(_organizerId: string, _startDate?: Date, _endDate?: Date): Promise<any> {
    // This would calculate organizer revenue from ticket sales
    return {
      totalRevenue: 0,
      platformFees: 0,
      netRevenue: 0,
      transactionCount: 0
    };
  }

  async getPlatformRevenue(_startDate?: Date, _endDate?: Date): Promise<any> {
    // This would calculate platform revenue
    return {
      subscriptionRevenue: 0,
      transactionFees: 0,
      totalRevenue: 0
    };
  }

  async validatePlanLimits(_userId: string, _action: 'create_event' | 'add_attendee'): Promise<boolean> {
    // This would check user's current plan and usage
    return true;
  }

  async getPlanFeatures(planType: PlanType): Promise<any> {
    return PLAN_FEATURES[planType];
  }

  async createRazorpayOrder(amount: number, currency: string, metadata?: any): Promise<any> {
    return await this.razorpay.orders.create({
      amount,
      currency,
      notes: metadata
    });
  }

  async verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  }

  private getPlanId(planType: PlanType): string {
    // These would be actual Razorpay plan IDs
    const planIds = {
      [PlanType.FREE]: '',
      [PlanType.PREMIUM]: 'plan_premium_monthly',
      [PlanType.PRO]: 'plan_pro_monthly'
    };
    return planIds[planType];
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(JSON.stringify(payload))
      .digest('hex');

    return expectedSignature === signature;
  }

  private async handlePaymentCaptured(_payment: any): Promise<void> {
    // Update transaction status to completed
    // Activate tickets
    // Send confirmation emails
  }

  private async handleSubscriptionCharged(_subscription: any): Promise<void> {
    // Update subscription status
    // Extend subscription period
    // Send receipt
  }

  private async handlePaymentFailed(_payment: any): Promise<void> {
    // Update transaction status to failed
    // Send failure notification
    // Cancel pending tickets
  }
}