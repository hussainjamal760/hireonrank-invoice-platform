import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Employee, Company, EmployeeProfile } from './models';
import { parsePayrollText } from './services/aiPayrollService';

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hor-invoice';
  await mongoose.connect(mongoUri);
  console.log("DB connected");

  // Fetch some employee
  const employee = await Employee.findOne();
  if (!employee) {
    console.log("No employee found");
    return;
  }
  console.log("Found employee:", employee.name, employee._id);

  const company = await Company.findById(employee.companyId);
  if (!company) {
    console.log("No company found");
    return;
  }

  let profile = await EmployeeProfile.findOne({ employeeId: employee._id });
  if (!profile) {
    profile = await EmployeeProfile.create({
      employeeId: employee._id,
      companyId: employee.companyId,
      baseSalary: employee.salary || 0,
      currency: 'USD',
      allowances: [],
      taxRules: []
    });
  }

  const promptText = `Generate June payroll for ${employee.name} with 15,000 transport allowance, 10,000 medical allowance, 5,000 performance bonus and standard tax deductions.`;
  console.log("Calling parsePayrollText...");
  try {
    const res = await parsePayrollText(promptText, employee, company, profile);
    console.log("Result:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
