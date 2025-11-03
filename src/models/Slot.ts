import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISlot extends Document {
  startTime: Date;
  endTime: Date;
  date: Date;
  isBooked: boolean;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
SlotSchema.index({ userId: 1, date: 1 });
SlotSchema.index({ userId: 1, isBooked: 1 });
SlotSchema.index({ date: 1, isBooked: 1 });
// Unique index to prevent duplicate slots for same user at same time
SlotSchema.index({ userId: 1, startTime: 1 }, { unique: true });
// Optimized index for common query patterns
SlotSchema.index({ userId: 1, startTime: 1, isBooked: 1 });

export const Slot = mongoose.model<ISlot>("Slot", SlotSchema);
