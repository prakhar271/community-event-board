import { Subscription, Transaction, Ticket } from '../../shared/models/Payment';
import { PlanType, SubscriptionStatus, TransactionType, TransactionStatus, TicketStatus } from '../../shared/types';

export class SubscriptionModel implements Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  razorpaySubscriptionId?: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Subscription>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.planType = data.planType || PlanType.FREE;
    this.status = data.status || SubscriptionStatus.ACTIVE;
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || new Date();
    this.amount = data.amount || 0;
    this.currency = data.currency || 'INR';
    this.paymentMethod = data.paymentMethod || '';
    this.razorpaySubscriptionId = data.razorpaySubscriptionId;
    this.autoRenew = data.autoRenew !== false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromDatabase(row: any): SubscriptionModel {
    return new SubscriptionModel({
      id: row.id,
      userId: row.user_id,
      planType: row.plan_type,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      amount: row.amount,
      currency: row.currency,
      paymentMethod: row.payment_method,
      razorpaySubscriptionId: row.razorpay_subscription_id,
      autoRenew: row.auto_renew,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  toDatabase(): any {
    return {
      id: this.id,
      user_id: this.userId,
      plan_type: this.planType,
      status: this.status,
      start_date: this.startDate,
      end_date: this.endDate,
      amount: this.amount,
      currency: this.currency,
      payment_method: this.paymentMethod,
      razorpay_subscription_id: this.razorpaySubscriptionId,
      auto_renew: this.autoRenew,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date();
  }

  isExpired(): boolean {
    return this.endDate <= new Date();
  }
}

export class TransactionModel implements Transaction {
  id: string;
  userId: string;
  eventId?: string;
  subscriptionId?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentGatewayId: string;
  paymentMethod?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;

  constructor(data: Partial<Transaction>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.eventId = data.eventId;
    this.subscriptionId = data.subscriptionId;
    this.type = data.type || TransactionType.TICKET;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'INR';
    this.status = data.status || TransactionStatus.PENDING;
    this.paymentGatewayId = data.paymentGatewayId || '';
    this.paymentMethod = data.paymentMethod;
    this.failureReason = data.failureReason;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt || new Date();
    this.completedAt = data.completedAt;
  }

  static fromDatabase(row: any): TransactionModel {
    return new TransactionModel({
      id: row.id,
      userId: row.user_id,
      eventId: row.event_id,
      subscriptionId: row.subscription_id,
      type: row.type,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      paymentGatewayId: row.payment_gateway_id,
      paymentMethod: row.payment_method,
      failureReason: row.failure_reason,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.created_at,
      completedAt: row.completed_at
    });
  }

  toDatabase(): any {
    return {
      id: this.id,
      user_id: this.userId,
      event_id: this.eventId,
      subscription_id: this.subscriptionId,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      payment_gateway_id: this.paymentGatewayId,
      payment_method: this.paymentMethod,
      failure_reason: this.failureReason,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      created_at: this.createdAt,
      completed_at: this.completedAt
    };
  }

  complete(): void {
    this.status = TransactionStatus.COMPLETED;
    this.completedAt = new Date();
  }

  fail(reason: string): void {
    this.status = TransactionStatus.FAILED;
    this.failureReason = reason;
  }
}

export class TicketModel implements Ticket {
  id: string;
  eventId: string;
  userId: string;
  registrationId: string;
  price: number;
  status: TicketStatus;
  purchasedAt: Date;
  qrCode: string;
  transactionId: string;

  constructor(data: Partial<Ticket>) {
    this.id = data.id || '';
    this.eventId = data.eventId || '';
    this.userId = data.userId || '';
    this.registrationId = data.registrationId || '';
    this.price = data.price || 0;
    this.status = data.status || TicketStatus.ACTIVE;
    this.purchasedAt = data.purchasedAt || new Date();
    this.qrCode = data.qrCode || '';
    this.transactionId = data.transactionId || '';
  }

  static fromDatabase(row: any): TicketModel {
    return new TicketModel({
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      registrationId: row.registration_id,
      price: row.price,
      status: row.status,
      purchasedAt: row.purchased_at,
      qrCode: row.qr_code,
      transactionId: row.transaction_id
    });
  }

  toDatabase(): any {
    return {
      id: this.id,
      event_id: this.eventId,
      user_id: this.userId,
      registration_id: this.registrationId,
      price: this.price,
      status: this.status,
      purchased_at: this.purchasedAt,
      qr_code: this.qrCode,
      transaction_id: this.transactionId
    };
  }

  use(): void {
    if (this.status === TicketStatus.ACTIVE) {
      this.status = TicketStatus.USED;
    }
  }

  refund(): void {
    this.status = TicketStatus.REFUNDED;
  }
}