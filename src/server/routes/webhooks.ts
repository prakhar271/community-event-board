import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';
import { RealTimeService } from '../services/RealTimeService';
import { env } from '../config/env';
import { logger } from '../config/logger';

const router = Router();

// Razorpay webhook handler
router.post('/razorpay', async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);
    
    if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
      logger.warn('Razorpay webhook: Missing signature or secret');
      return res.status(400).json({ error: 'Missing signature or webhook secret' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Razorpay webhook: Invalid signature', { 
        received: signature,
        expected: expectedSignature 
      });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    logger.info('Razorpay webhook received', { 
      event: event.event,
      paymentId: event.payload?.payment?.entity?.id 
    });

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
        
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity);
        break;
        
      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity);
        break;
        
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
        
      default:
        logger.info('Unhandled Razorpay webhook event', { event: event.event });
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error('Razorpay webhook error', error as Error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment captured (successful payment)
async function handlePaymentCaptured(payment: any) {
  try {
    const { EventRepository } = await import('../repositories/EventRepository');
    const eventRepository = new EventRepository();
    const paymentService = new PaymentService(eventRepository);
    
    // Update transaction status
    await paymentService.updateTransactionStatus(
      payment.id,
      'completed',
      {
        razorpay_payment_id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        captured_at: new Date(payment.created_at * 1000)
      }
    );

    // Get transaction details to notify user
    const transaction = await paymentService.getTransactionByGatewayId(payment.id);
    if (transaction) {
      logger.info('Payment captured - transaction found', { 
        transactionId: transaction.id,
        userId: transaction.userId,
        amount: payment.amount 
      });
    }

    logger.info('Payment captured successfully', { 
      paymentId: payment.id,
      amount: payment.amount,
      transactionId: transaction?.id 
    });
  } catch (error) {
    logger.error('Failed to handle payment captured', error as Error, { paymentId: payment.id });
  }
}

// Payment failed
async function handlePaymentFailed(payment: any) {
  try {
    const { EventRepository } = await import('../repositories/EventRepository');
    const eventRepository = new EventRepository();
    const paymentService = new PaymentService(eventRepository);
    
    // Update transaction status
    await paymentService.updateTransactionStatus(
      payment.id,
      'failed',
      {
        razorpay_payment_id: payment.id,
        failure_reason: payment.error_description || 'Payment failed',
        failed_at: new Date(payment.created_at * 1000)
      }
    );

    // Get transaction details to notify user
    const transaction = await paymentService.getTransactionByGatewayId(payment.id);
    if (transaction) {
      logger.warn('Payment failed - transaction found', { 
        transactionId: transaction.id,
        userId: transaction.userId,
        reason: payment.error_description 
      });
    }

    logger.warn('Payment failed', { 
      paymentId: payment.id,
      reason: payment.error_description,
      transactionId: transaction?.id 
    });
  } catch (error) {
    logger.error('Failed to handle payment failure', error as Error, { paymentId: payment.id });
  }
}

// Payment authorized (needs manual capture)
async function handlePaymentAuthorized(payment: any) {
  try {
    const { EventRepository } = await import('../repositories/EventRepository');
    const eventRepository = new EventRepository();
    const paymentService = new PaymentService(eventRepository);
    
    // Update transaction status
    await paymentService.updateTransactionStatus(
      payment.id,
      'authorized',
      {
        razorpay_payment_id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        authorized_at: new Date(payment.created_at * 1000)
      }
    );

    logger.info('Payment authorized', { 
      paymentId: payment.id,
      amount: payment.amount 
    });
  } catch (error) {
    logger.error('Failed to handle payment authorization', error as Error, { paymentId: payment.id });
  }
}

// Refund created
async function handleRefundCreated(refund: any) {
  try {
    const { EventRepository } = await import('../repositories/EventRepository');
    const eventRepository = new EventRepository();
    const paymentService = new PaymentService(eventRepository);
    
    // Create refund record
    await paymentService.createRefund({
      payment_id: refund.payment_id,
      refund_id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      created_at: new Date(refund.created_at * 1000)
    });

    logger.info('Refund created', { 
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount 
    });
  } catch (error) {
    logger.error('Failed to handle refund creation', error as Error, { refundId: refund.id });
  }
}

// Subscription charged
async function handleSubscriptionCharged(subscription: any, payment: any) {
  try {
    const { EventRepository } = await import('../repositories/EventRepository');
    const eventRepository = new EventRepository();
    const paymentService = new PaymentService(eventRepository);
    
    // Update subscription payment
    await paymentService.updateSubscriptionPayment(
      subscription.id,
      payment.id,
      'completed'
    );

    logger.info('Subscription charged', { 
      subscriptionId: subscription.id,
      paymentId: payment.id,
      amount: payment.amount 
    });
  } catch (error) {
    logger.error('Failed to handle subscription charge', error as Error, { 
      subscriptionId: subscription.id,
      paymentId: payment.id 
    });
  }
}

// Subscription cancelled
async function handleSubscriptionCancelled(subscription: any) {
  try {
    const { EventRepository } = await import('../repositories/EventRepository');
    const eventRepository = new EventRepository();
    const paymentService = new PaymentService(eventRepository);
    
    // Update subscription status
    await paymentService.updateSubscriptionStatus(
      subscription.id,
      'cancelled'
    );

    logger.info('Subscription cancelled', { 
      subscriptionId: subscription.id 
    });
  } catch (error) {
    logger.error('Failed to handle subscription cancellation', error as Error, { 
      subscriptionId: subscription.id 
    });
  }
}

export default router;