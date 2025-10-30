import mongoose, { Document, Schema } from 'mongoose';

export type ReminderCategory = 'cati' | 'tesisat' | 'elektrik' | 'bahce' | 'boya' | 'klima';

export interface IReminder extends Document {
  homeowner: mongoose.Types.ObjectId;
  name: string;
  category: ReminderCategory;
  frequencyDays: number; // reminder cadence in days
  nextDueDate: Date; // computed from createdAt or user selection
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    homeowner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['cati', 'tesisat', 'elektrik', 'bahce', 'boya', 'klima'],
      required: true
    },
    frequencyDays: {
      type: Number,
      required: true,
      min: 1
    },
    nextDueDate: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);


