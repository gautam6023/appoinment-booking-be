import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  userId: string;
  sharableId: string;
  timezone: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      unique: true,
      sparse: true,
    },
    sharableId: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.sharableId) {
    this.sharableId = randomUUID();
  }

  if (!this.userId && this._id) {
    this.userId = (this._id as Types.ObjectId).toString();
  }

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
