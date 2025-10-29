import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  homeowner: mongoose.Types.ObjectId;
  professional?: mongoose.Types.ObjectId;
  scheduledDate?: Date;
  completedDate?: Date;
  price?: number;
  notes?: string;
  images?: string[];
  photoUrl?: string;
  minPrice?: number;
  maxPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['plumbing', 'electrical', 'hvac', 'appliances', 'paint', 'furniture', 'flooring', 'roofing', 'general', 'other']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    location: {
      type: String,
      trim: true
    },
    homeowner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    professional: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    scheduledDate: {
      type: Date
    },
    completedDate: {
      type: Date
    },
    price: {
      type: Number
    },
    notes: {
      type: String
    },
    images: [{
      type: String
    }],
    photoUrl: {
      type: String
    },
    minPrice: {
      type: Number,
      min: 0
    },
    maxPrice: {
      type: Number,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IJob>('Job', JobSchema);

