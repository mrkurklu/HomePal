import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  job: mongoose.Types.ObjectId;
  homeowner: mongoose.Types.ObjectId;
  professional: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string; // card, cash, etc
  cardLast4?: string;
  cardBrand?: string;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    homeowner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      default: 'card'
    },
    cardLast4: {
      type: String
    },
    cardBrand: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    stripePaymentIntentId: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);

