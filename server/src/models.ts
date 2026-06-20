import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  age?: number;
  occupation?: string;
  phoneNumber?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  googleId: { type: String },
  profilePicture: { type: String },
  age: { type: Number },
  occupation: { type: String },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);

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

OtpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const OtpVerification = mongoose.model<IOtpVerification>('OtpVerification', OtpVerificationSchema);

export interface ICompany extends Document {
  name: string;
  logo?: string;
  ownerId: mongoose.Types.ObjectId;
  address?: string;
  country?: string;
  location?: { lat: number; lng: number };
  companyType?: string;
  employeesCount?: string;
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  logo: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  country: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  companyType: { type: String },
  employeesCount: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Company = mongoose.model<ICompany>('Company', CompanySchema);

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

UserCompanySchema.index({ userId: 1, companyId: 1 }, { unique: true });

export const UserCompany = mongoose.model<IUserCompany>('UserCompany', UserCompanySchema);

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

// Employee Interface & Schema
export interface IEmployee extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  salary: number;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
  joinDate: Date;
  createdAt: Date;
}

const EmployeeSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  designation: { type: String },
  department: { type: String },
  salary: { type: Number, required: true, default: 0 },
  bankDetails: {
    accountNumber: { type: String },
    bankName: { type: String },
    ifscCode: { type: String }
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', required: true },
  joinDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

EmployeeSchema.index({ companyId: 1, email: 1 }, { unique: true });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

// Invoice Interface & Schema
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InvoiceItemSchema: Schema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const InvoiceSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  invoiceNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String },
  clientAddress: { type: String },
  items: { type: [InvoiceItemSchema], required: true, validate: [(v: any[]) => v.length > 0, 'At least one item is required'] },
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

InvoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ companyId: 1, status: 1 });
InvoiceSchema.index({ companyId: 1, issueDate: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

// PayrollRecord Interface & Schema
export type PayrollStatus = 'PENDING' | 'PROCESSED' | 'PAID';

export interface IPayrollRecord extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeEmail: string;
  period: string;
  baseSalary: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  status: PayrollStatus;
  paidAt?: Date;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PayrollRecordSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  period: { type: String, required: true },
  baseSalary: { type: Number, required: true, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  bonuses: { type: Number, default: 0, min: 0 },
  netPay: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'PROCESSED', 'PAID'], default: 'PENDING', required: true },
  paidAt: { type: Date },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

PayrollRecordSchema.index({ companyId: 1, period: 1 });
PayrollRecordSchema.index({ companyId: 1, employeeId: 1, period: 1 }, { unique: true });

export const PayrollRecord = mongoose.model<IPayrollRecord>('PayrollRecord', PayrollRecordSchema);

// ActivityLog Interface & Schema
export type ActivityAction =
  | 'INVOICE_CREATED' | 'INVOICE_SENT' | 'INVOICE_PAID' | 'INVOICE_CANCELLED'
  | 'EMPLOYEE_ADDED' | 'EMPLOYEE_UPDATED' | 'EMPLOYEE_REMOVED'
  | 'PAYROLL_GENERATED' | 'PAYROLL_PAID'
  | 'MEMBER_INVITED' | 'MEMBER_JOINED'
  | 'COMPANY_UPDATED';

export interface IActivityLog extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: {
    type: String,
    enum: [
      'INVOICE_CREATED', 'INVOICE_SENT', 'INVOICE_PAID', 'INVOICE_CANCELLED',
      'EMPLOYEE_ADDED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_REMOVED',
      'PAYROLL_GENERATED', 'PAYROLL_PAID',
      'MEMBER_INVITED', 'MEMBER_JOINED',
      'COMPANY_UPDATED'
    ],
    required: true
  },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

ActivityLogSchema.index({ companyId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
