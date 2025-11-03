import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  userId: Types.ObjectId;
  slotId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  guests: string[];
  reason?: string;
  status: "pending" | "done";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    guests: {
      type: [String],
      default: [],
    },
    reason: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ userId: 1, isDeleted: 1 });
AppointmentSchema.index({ slotId: 1 });
// Optimized index for listing appointments with sorting by creation date
AppointmentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

export const Appointment = mongoose.model<IAppointment>("Appointment", AppointmentSchema);
