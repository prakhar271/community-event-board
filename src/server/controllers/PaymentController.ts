import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { CreateSubscriptionRequest, CreateTicketPurchaseRequest, RefundRequest } from '../../shared/models/Payment';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const subscriptionData: CreateSubscriptionRequest = req.body;
      
      const result = await this.paymentService.createSubscription(userId, subscriptionData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Subscription created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed'
      });
    }
  }

  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const subscription = await this.paymentService.getSubscription(userId);
      
      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscription'
      });
    }
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { planType } = req.body;
      
      const subscription = await this.paymentService.updateSubscription(userId, planType);
      
      res.json({
        success: true,
        data: subscription,
        message: 'Subscription updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Subscription update failed'
      });
    }
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const subscription = await this.paymentService.cancelSubscription(userId);
      
      res.json({
        success: true,
        data: subscription,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Subscription cancellation failed'
      });
    }
  }

  async purchaseTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const purchaseData: CreateTicketPurchaseRequest = req.body;
      
      const result = await this.paymentService.purchaseTickets(userId, purchaseData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Ticket purchase initiated'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Ticket purchase failed'
      });
    }
  }

  async getTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const tickets = await this.paymentService.getUserTickets(userId);
      
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tickets'
      });
    }
  }

  async getTicket(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const ticket = await this.paymentService.getTicket(id);
      
      if (!ticket) {
        res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ticket'
      });
    }
  }

  async validateTicket(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { qrCode } = req.body;
      
      const isValid = await this.paymentService.validateTicket(id, qrCode);
      
      res.json({
        success: true,
        data: { isValid },
        message: isValid ? 'Ticket is valid' : 'Invalid ticket'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Ticket validation failed'
      });
    }
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      
      const transactions = await this.paymentService.getUserTransactions(userId);
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions'
      });
    }
  }

  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const transaction = await this.paymentService.getTransaction(id);
      
      if (!transaction) {
        res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction'
      });
    }
  }

  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const refundData: RefundRequest = req.body;
      
      const transaction = await this.paymentService.processRefund(refundData);
      
      res.json({
        success: true,
        data: transaction,
        message: 'Refund processed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed'
      });
    }
  }

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency, metadata } = req.body;
      
      const paymentIntent = await this.paymentService.createPaymentIntent(amount, currency, metadata);
      
      res.json({
        success: true,
        data: paymentIntent
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Payment intent creation failed'
      });
    }
  }

  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.body;
      
      const transaction = await this.paymentService.confirmPayment(paymentIntentId);
      
      res.json({
        success: true,
        data: transaction,
        message: 'Payment confirmed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const payload = req.body;
      
      await this.paymentService.handleWebhook(payload, signature);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        error: 'Webhook processing failed'
      });
    }
  }

  async getOrganizerRevenue(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user.userId;
      const { startDate, endDate } = req.query;
      
      const revenue = await this.paymentService.getOrganizerRevenue(
        organizerId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch revenue data'
      });
    }
  }

  async getPlatformRevenue(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const revenue = await this.paymentService.getPlatformRevenue(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch platform revenue'
      });
    }
  }

  async getPlanFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { planType } = req.params;
      
      const features = await this.paymentService.getPlanFeatures(planType as any);
      
      res.json({
        success: true,
        data: features
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch plan features'
      });
    }
  }
}