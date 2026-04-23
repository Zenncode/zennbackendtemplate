import { HydratedDocument, Model, Schema, model, models } from 'mongoose';

export interface Admin {
  email: string;
  passwordHash: string;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<Admin>;

const adminSchema = new Schema<Admin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokenHash: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: 'admins',
  },
);

export const AdminModel: Model<Admin> =
  (models.Admin as Model<Admin> | undefined) ?? model<Admin>('Admin', adminSchema);
