import Razorpay from 'razorpay';
import crypto from 'crypto';
import userModel from '../models/model.js';
import paymentModel from '../models/paymentModel.js';
import ChatModel from '../models/ChatModel.js'; // Import ChatModel

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new order for subscription purchase
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan } = req.body;

    if (!plan || (plan !== 'monthly' && plan !== 'annually')) {
      return res.json({ success: false, message: 'Invalid plan type!' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found!' });
    }

    let amount;
    if (plan === 'monthly') {
      amount = 100;
    } else {
      amount = 1000;
    }

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `order_receipt_${userId}`,
      notes: {
        userId: userId,
        plan: plan,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const userId = req.userId;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found!' });
    }

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();

    if (plan === 'monthly') {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    }

    if (payment.status !== 'captured') {
      user.isPremium = false;
      user.subscriptionType = 'none';
      user.subscriptionEndDate = subscriptionEndDate;
    } else {
      user.isPremium = true;
      user.subscriptionType = plan;
      user.subscriptionEndDate = subscriptionEndDate;
    }

    const paymentRecord = new paymentModel({
      userId: userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      plan: plan,
      subscriptionStartDate: subscriptionStartDate,
      subscriptionEndDate: subscriptionEndDate,
      metadata: {
        description: `${plan} subscription payment`,
        razorpay_data: {
          method: payment.method,
          bank: payment.bank,
          card_id: payment.card_id,
          wallet: payment.wallet,
          vpa: payment.vpa,
          email: payment.email,
          contact: payment.contact,
          fee: payment.fee,
          tax: payment.tax,
        },
      },
    });

    // Update ChatModel userType
    const todayChat = await ChatModel.findOne({
      userId,
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (todayChat) {
      todayChat.userType = payment.status === 'captured' ? 'premium' : (user.isTrial ? 'trial' : 'free');
      await todayChat.save();
    }

    await Promise.all([user.save(), paymentRecord.save()]);

    if (payment.status !== 'captured') {
      return res.json({
        success: false,
        message: 'Payment verification failed: Payment not captured',
      });
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully!',
      subscriptionEndDate: subscriptionEndDate,
      plan: plan,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
};

// Start free trial
export const startFreeTrial = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found!' });
    }

    if (
      user.subscriptionType === 'trial' ||
      (user.trialEndDate && new Date(user.trialEndDate) > new Date())
    ) {
      return res.json({
        success: false,
        message: 'You already have an active trial!',
      });
    }

    if (user.trialEndDate && new Date(user.trialEndDate) <= new Date()) {
      return res.json({
        success: false,
        message: 'Your free trial period has been used!',
      });
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    user.isTrial = true;
    user.subscriptionType = 'trial';
    user.trialEndDate = trialEndDate;

    // Update ChatModel userType
    const todayChat = await ChatModel.findOne({
      userId,
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (todayChat) {
      todayChat.userType = 'trial';
      await todayChat.save();
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Free trial activated successfully!',
      trialEndDate: trialEndDate,
    });
  } catch (error) {
    console.error('Trial activation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to activate free trial',
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found!' });
    }

    if (!user.isPremium) {
      return res.json({
        success: false,
        message: "You don't have an active subscription to cancel!",
      });
    }

    user.isPremium = false;
    user.subscriptionType = 'none';
    user.subscriptionEndDate = new Date();

    // Update ChatModel userType
    const todayChat = await ChatModel.findOne({
      userId,
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (todayChat) {
      todayChat.userType = user.isTrial ? 'trial' : 'free';
      await todayChat.save();
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Subscription canceled successfully!',
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription',
    });
  }
};

// Handle Razorpay webhook
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers['x-razorpay-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== receivedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const { event, payload: eventPayload } = req.body;

    if (event === 'subscription.cancelled') {
      const subscriptionId = eventPayload.subscription.entity.id;
      const user = await userModel.findOne({ subscriptionId });

      if (!user) {
        console.warn(`User not found for subscription ID: ${subscriptionId}`);
        return res.status(404).json({
          success: false,
          message: 'User not found for subscription',
        });
      }

      user.isPremium = false;
      user.subscriptionType = 'none';
      user.subscriptionEndDate = new Date();
      user.subscriptionId = null;

      // Update ChatModel userType
      const todayChat = await ChatModel.findOne({
        userId: user._id,
        createdAt: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lte: new Date().setHours(23, 59, 59, 999),
        },
      });

      if (todayChat) {
        todayChat.userType = user.isTrial ? 'trial' : 'free';
        await todayChat.save();
      }

      await user.save();

      console.log(`Subscription canceled for user: ${user.email}`);
      return res.status(200).json({
        success: true,
        message: 'Subscription canceled successfully',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook event processed',
    });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
    });
  }
};

// Get payment history for a user
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const payments = await paymentModel
      .find({ userId: userId })
      .sort({ createdAt: -1 });

    const formattedPayments = payments.map((payment) => {
      let statusLabel;
      switch (payment.status) {
        case 'captured':
          statusLabel = 'Paid';
          break;
        case 'refunded':
          statusLabel = 'Refunded';
          break;
        case 'failed':
          statusLabel = 'Failed';
          break;
        default:
          statusLabel = 'Processing';
      }

      return {
        id: payment._id,
        date: payment.createdAt,
        amount: (payment.amount / 100).toFixed(2),
        status: statusLabel,
        plan: payment.plan,
        paymentMethod: payment.metadata?.razorpay_data?.method || payment.paymentMethod,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        currency: payment.currency,
        subscriptionPeriod: {
          start: payment.subscriptionStartDate,
          end: payment.subscriptionEndDate,
        },
        fee: payment.metadata?.razorpay_data?.fee || 0,
        tax: payment.metadata?.razorpay_data?.tax || 0,
      };
    });

    return res.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error('Payment history fetch error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history',
    });
  }
};