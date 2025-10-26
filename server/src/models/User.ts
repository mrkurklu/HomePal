import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'homeowner' | 'professional';
  phone?: string;
  address?: string;
  specialties?: string[]; // For professionals
  rating?: number;
  completedJobs?: number;
  // Payment card info
  cardLast4?: string;
  cardBrand?: string;
  cardHolderName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['homeowner', 'professional'],
      required: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    specialties: [{
      type: String,
      trim: true
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    cardLast4: {
      type: String,
      maxlength: 4
    },
    cardBrand: {
      type: String,
      trim: true
    },
    cardHolderName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUser>('User', UserSchema);

