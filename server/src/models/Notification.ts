import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'quote-received' | 'quote-accepted' | 'quote-rejected' | 'job-assigned' | 'job-completed';
  message: string;
  relatedJob?: mongoose.Types.ObjectId;
  relatedQuote?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['quote-received', 'quote-accepted', 'quote-rejected', 'job-assigned', 'job-completed'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedJob: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    },
    relatedQuote: {
      type: Schema.Types.ObjectId,
      ref: 'Quote'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);

