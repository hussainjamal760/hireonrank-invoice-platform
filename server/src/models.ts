import mongoose, { Schema, Document } from 'mongoose';

// User Interface & Schema
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  googleId: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);

// OTP Verification Interface & Schema
export interface IOtpVerification extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OtpVerificationSchema: Schema = new Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete OTPs after 1 hour to save space
OtpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const OtpVerification = mongoose.model<IOtpVerification>('OtpVerification', OtpVerificationSchema);

// Company Interface & Schema
export interface ICompany extends Document {
  name: string;
  logo?: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  logo: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Company = mongoose.model<ICompany>('Company', CompanySchema);

// UserCompany Interface & Schema (Multi-tenant company links)
export type UserRole = 'OWNER' | 'ADMIN' | 'EMPLOYEE' | 'ACCOUNTANT';

export interface IUserCompany extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  role: UserRole;
  createdAt: Date;
}

const UserCompanySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  role: { 
    type: String, 
    enum: ['OWNER', 'ADMIN', 'EMPLOYEE', 'ACCOUNTANT'], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only have one membership role per company
UserCompanySchema.index({ userId: 1, companyId: 1 }, { unique: true });

export const UserCompany = mongoose.model<IUserCompany>('UserCompany', UserCompanySchema);

// Invitation Interface & Schema
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export interface IInvitation extends Document {
  companyId: mongoose.Types.ObjectId;
  email: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  createdAt: Date;
}

const InvitationSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  email: { type: String, required: true, index: true },
  role: { 
    type: String, 
    enum: ['OWNER', 'ADMIN', 'EMPLOYEE', 'ACCOUNTANT'], 
    required: true 
  },
  token: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'EXPIRED'], 
    default: 'PENDING',
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
