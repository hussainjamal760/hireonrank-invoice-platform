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
  preferredCurrency?: string;
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
  preferredCurrency: { type: String, default: 'USD' },
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
  contactNumber?: string;
  website?: string;
  country?: string;
  location?: { lat: number; lng: number };
  companyType?: string;
  employeesCount?: string;
  departments?: string[];
  status: 'ACTIVE' | 'BANNED';
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  logo: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  contactNumber: { type: String },
  website: { type: String },
  country: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  companyType: { type: String },
  employeesCount: { type: String },
  departments: { type: [String], default: [] },
  status: { type: String, enum: ['ACTIVE', 'BANNED'], default: 'ACTIVE', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Company = mongoose.model<ICompany>('Company', CompanySchema);

export interface IClient extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  taxId: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ClientSchema.index({ companyId: 1, email: 1 });

export const Client = mongoose.model<IClient>('Client', ClientSchema);

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
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
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
  viewedAt?: Date;
  sentAt?: Date;
  publicLinkToken?: string;
  notes?: string;
  currency: string;
  logoUrl?: string;
  customFields?: { name: string; value: string }[];
  employeeIds?: mongoose.Types.ObjectId[];
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
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  invoiceNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String },
  clientAddress: { type: String },
  items: { type: [InvoiceItemSchema], required: true, validate: [(v: any[]) => v.length > 0, 'At least one item is required'] },
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paidAt: { type: Date },
  viewedAt: { type: Date },
  sentAt: { type: Date },
  publicLinkToken: { type: String, unique: true, sparse: true },
  notes: { type: String },
  currency: { type: String, default: 'USD' },
  logoUrl: { type: String },
  customFields: { type: [Schema.Types.Mixed], default: [] },
  employeeIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
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
  currency: string;
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
  currency: { type: String, default: 'USD', required: true },
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
  | 'INVOICE_CREATED' | 'INVOICE_SENT' | 'INVOICE_VIEWED' | 'INVOICE_PAID' | 'INVOICE_CANCELLED'
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
      'INVOICE_CREATED', 'INVOICE_SENT', 'INVOICE_VIEWED', 'INVOICE_PAID', 'INVOICE_CANCELLED',
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

// --- Company-Based Accountant SaaS Extensions ---

export interface IAllowance {
  name: string;
  amount: number;
}

export interface ITaxRule {
  name: string;
  rate: number; // percentage
}

export interface IEmployeeProfile extends Document {
  employeeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  baseSalary: number;
  currency: string;
  bonusThisMonth?: number;
  deductionThisMonth?: number;
  allowances: IAllowance[];
  taxRules: ITaxRule[];
  createdAt: Date;
}

const AllowanceSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 }
}, { _id: false });

const TaxRuleSchema = new Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true, default: 0 } // e.g. 10 for 10%
}, { _id: false });

const EmployeeProfileSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  baseSalary: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'USD' },
  bonusThisMonth: { type: Number, default: 0 },
  deductionThisMonth: { type: Number, default: 0 },
  allowances: { type: [AllowanceSchema], default: [] },
  taxRules: { type: [TaxRuleSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export const EmployeeProfile = mongoose.model<IEmployeeProfile>('EmployeeProfile', EmployeeProfileSchema);

export interface IPayroll extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  month: string; // e.g. "2026-06"
  baseSalary: number;
  totalAllowances: number;
  totalTax: number;
  netSalary: number;
  currency: string;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PayrollSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  month: { type: String, required: true },
  baseSalary: { type: Number, required: true, default: 0 },
  totalAllowances: { type: Number, required: true, default: 0 },
  totalTax: { type: Number, required: true, default: 0 },
  netSalary: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD', required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

PayrollSchema.index({ companyId: 1, employeeId: 1, month: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayroll>('Payroll', PayrollSchema);

export interface IPayrollInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  month: string;
  amount: number;
  currency: string;
  status: 'generated' | 'paid' | 'pending';
  createdAt: Date;
}

const PayrollInvoiceSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  invoiceNumber: { type: String, required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD', required: true },
  status: { type: String, enum: ['generated', 'paid', 'pending'], default: 'generated', required: true },
  createdAt: { type: Date, default: Date.now }
});

PayrollInvoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });
PayrollInvoiceSchema.index({ companyId: 1, employeeId: 1, month: 1 }, { unique: true });

export const PayrollInvoice = mongoose.model<IPayrollInvoice>('PayrollInvoice', PayrollInvoiceSchema);

export interface ITemplateSection {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  column?: string;
}

export interface ITemplateBranding {
  logoUrl?: string;
  companyName?: string;
  companyAddress?: string;
  website?: string;
  phone?: string;
  defaultNotes?: string;
  defaultTerms?: string;
}

export interface ITemplateThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface ITemplateTypography {
  fontFamily: string;
  headingSize: number;
  bodySize: number;
  fontWeight: string;
}

export interface ITemplateLayout {
  headerStyle: string;
  footerStyle: string;
  sectionSpacing: number;
  borderRadius: number;
  tableStyle: string;
  pageMargins: number;
  structure: string;
  watermark: boolean;
  backgroundPattern: string;
}

export type InvoiceTheme = 'modern-corporate' | 'minimal-clean' | 'professional-blue' | 'dark-elegant' | 'startup-style' | 'financial-premium';

export interface IInvoiceTemplate extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  theme: InvoiceTheme;
  sections: ITemplateSection[];
  branding: ITemplateBranding;
  themeSettings: ITemplateThemeSettings;
  typography: ITemplateTypography;
  layout: ITemplateLayout;
  isDefault: boolean;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSectionSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  visible: { type: Boolean, default: true },
  order: { type: Number, required: true },
  column: { type: String, default: 'main' }
}, { _id: false });

const TemplateBrandingSchema = new Schema({
  logoUrl: { type: String },
  companyName: { type: String },
  companyAddress: { type: String },
  website: { type: String },
  phone: { type: String },
  defaultNotes: { type: String },
  defaultTerms: { type: String }
}, { _id: false });

const TemplateThemeSettingsSchema = new Schema({
  primaryColor: { type: String, default: '#FACC15' },
  secondaryColor: { type: String, default: '#000000' },
  accentColor: { type: String, default: '#3B82F6' }
}, { _id: false });

const TemplateTypographySchema = new Schema({
  fontFamily: { type: String, default: 'Inter' },
  headingSize: { type: Number, default: 24 },
  bodySize: { type: Number, default: 14 },
  fontWeight: { type: String, default: 'normal' }
}, { _id: false });

const TemplateLayoutSchema = new Schema({
  headerStyle: { type: String, default: 'standard' },
  footerStyle: { type: String, default: 'standard' },
  sectionSpacing: { type: Number, default: 16 },
  borderRadius: { type: Number, default: 0 },
  tableStyle: { type: String, default: 'bordered' },
  pageMargins: { type: Number, default: 40 },
  structure: { type: String, default: 'standard' },
  watermark: { type: Boolean, default: false },
  backgroundPattern: { type: String, default: 'none' }
}, { _id: false });

const InvoiceTemplateSchema: Schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true },
  theme: {
    type: String,
    enum: ['modern-corporate', 'minimal-clean', 'professional-blue', 'dark-elegant', 'startup-style', 'financial-premium'],
    default: 'modern-corporate',
    required: true
  },
  sections: { type: [TemplateSectionSchema], default: [] },
  branding: { type: TemplateBrandingSchema, default: () => ({}) },
  themeSettings: { type: TemplateThemeSettingsSchema, default: () => ({}) },
  typography: { type: TemplateTypographySchema, default: () => ({}) },
  layout: { type: TemplateLayoutSchema, default: () => ({}) },
  isDefault: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InvoiceTemplateSchema.index({ companyId: 1, name: 1 });
InvoiceTemplateSchema.index({ companyId: 1, isDefault: 1 });

export const InvoiceTemplate = mongoose.model<IInvoiceTemplate>('InvoiceTemplate', InvoiceTemplateSchema);
