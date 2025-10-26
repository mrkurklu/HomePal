import mongoose, { Document, Schema } from 'mongoose';

export interface IQuote extends Document {
  job: mongoose.Types.ObjectId;
  professional: mongoose.Types.ObjectId;
  homeowner: mongoose.Types.ObjectId;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    homeowner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IQuote>('Quote', QuoteSchema);

