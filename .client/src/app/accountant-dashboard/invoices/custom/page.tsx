"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Plus, Trash2, Save, ArrowLeft, 
  Upload, User, PlusCircle, CreditCard, Calendar,
  Briefcase, Percent, Calculator, Image as ImageIcon,
  CheckCircle2, ShieldAlert, ScrollText
} from "lucide-react";

interface Employee {
  _id: string;
  name: string;
  email: string;
  designation?: string;
}

interface CustomField {
  label: string;
  value: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CustomInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { label: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: keyof CustomField, value: string) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setCustomFields(newFields);
  };

  const toggleEmployee = (empId: string) => {
    if (selectedEmployees.includes(empId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== empId));
    } else {
      setSelectedEmployees([...selectedEmployees, empId]);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (taxRate / 100);
    return subtotal + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientAddress,
          items,
          taxRate,
          dueDate,
          notes,
          logoUrl,
          customFields,
          employeeIds: selectedEmployees
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create invoice");

      setSuccess("Custom invoice created successfully!");
      setTimeout(() => router.push("/accountant-dashboard/invoices"), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center border-b-[4px] border-black pb-6">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:underline font-bold text-sm mb-2"
          >
            <ArrowLeft size={16} /> Back to Ledger
          </button>
          <h1 className="font-display-lg text-4xl md:text-5xl text-black uppercase font-black tracking-tighter">
            Generate Custom Invoice
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F]">
          <ShieldAlert size={24} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00]">
          <CheckCircle2 size={24} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        
        {/* Section 1: Visual Identity */}
        <div className="bg-white border-[3px] border-black p-8 shadow-[8px_8px_0_0_#000000]">
          <h2 className="font-display-md text-2xl uppercase font-black mb-6 border-b-[2px] border-black pb-2 flex items-center gap-2">
            <ImageIcon size={24} className="text-[#FACC15]" /> Visual Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-xs font-black">Invoice Logo (URL)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1 bg-[#f6f3ec] border-[3px] border-black p-4 font-mono font-bold focus:outline-none focus:bg-[#FACC15] transition-colors"
                />
                {logoUrl && (
                  <div className="w-16 h-16 border-[3px] border-black bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-black/50 italic">Override company profile logo for this specific invoice.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Client & Logistics */}
        <div className="bg-[#fbfbfa] border-[3px] border-black p-8 shadow-[8px_8px_0_0_#FACC15]">
          <h2 className="font-display-md text-2xl uppercase font-black mb-6 border-b-[2px] border-black pb-2 flex items-center gap-2">
            <Briefcase size={24} /> Client & Logistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-black">Client Name *</label>
                <input
                  required
                  placeholder="e.g. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-white border-[3px] border-black p-4 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-black">Client Email</label>
                <input
                  type="email"
                  placeholder="billing@acme.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-white border-[3px] border-black p-4 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-black">Billing Address</label>
                <textarea
                  rows={2}
                  placeholder="123 Business Way, Suite 100..."
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="bg-white border-[3px] border-black p-4 font-mono font-bold focus:outline-none focus:bg-[#FACC15] resize-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-xs font-black flex items-center gap-2">
                  <Calendar size={14} /> Due Date *
                </label>
                <input
                  required
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white border-[3px] border-black p-4 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Line Items */}
        <div className="bg-white border-[3px] border-black p-8 shadow-[8px_8px_0_0_#3B82F6]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display-md text-2xl uppercase font-black flex items-center gap-2">
              <PlusCircle size={24} className="text-blue-500" /> Line Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-black text-white hover:bg-blue-500 border-[3px] border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[2px]"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-6 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase">Description</label>
                  <input
                    required
                    placeholder="Brief description of service..."
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="bg-[#f0f9ff] border-[2px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] text-sm"
                  />
                </div>
                <div className="col-span-4 md:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase">Qty</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                    className="bg-[#f0f9ff] border-[2px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] text-sm"
                  />
                </div>
                <div className="col-span-6 md:col-span-3 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase">Unit Price ($)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="bg-[#f0f9ff] border-[2px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] text-sm"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="w-full aspect-square bg-red-100 border-[2px] border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Employees (Customization) */}
        <div className="bg-[#fdfcf5] border-[3px] border-black p-8 shadow-[8px_8px_0_0_#10B981]">
          <h2 className="font-display-md text-2xl uppercase font-black mb-2 border-b-[2px] border-black pb-2 flex items-center gap-2">
            <User size={24} className="text-emerald-500" /> Tag Employees
          </h2>
          <p className="text-xs font-bold text-black/50 mb-6 italic">Select employees associated with this billing.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {employees.map((emp) => (
              <button
                key={emp._id}
                type="button"
                onClick={() => toggleEmployee(emp._id)}
                className={`p-3 border-[2px] border-black font-black text-[10px] uppercase transition-all flex flex-col items-center gap-2 ${
                  selectedEmployees.includes(emp._id)
                  ? "bg-black text-[#FACC15] shadow-[inset_4px_4px_0_0_rgba(255,255,255,0.2)]"
                  : "bg-white text-black hover:bg-[#FACC15]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-[2px] border-black flex items-center justify-center ${selectedEmployees.includes(emp._id) ? "bg-[#FACC15]" : "bg-black/10"}`}>
                  <User size={14} className={selectedEmployees.includes(emp._id) ? "text-black" : "text-black/30"} />
                </div>
                <span className="text-center line-clamp-1">{emp.name}</span>
              </button>
            ))}
            {employees.length === 0 && (
              <p className="col-span-full py-4 text-center font-bold text-black/40">No employees found to tag.</p>
            )}
          </div>
        </div>

        {/* Section 5: Custom Metadata & Fields */}
        <div className="bg-[#fbfbfa] border-[3px] border-black p-8 shadow-[8px_8px_0_0_#9333EA]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display-md text-2xl uppercase font-black flex items-center gap-2">
              <PlusCircle size={24} className="text-purple-500" /> Custom Fields
            </h2>
            <button
              type="button"
              onClick={addCustomField}
              className="bg-black text-white hover:bg-purple-500 border-[3px] border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-2"
            >
              <Plus size={16} /> Add Field
            </button>
          </div>
          <p className="text-xs font-bold text-black/50 mb-6 italic">Add custom information like VAT ID, PO Number, Project Name, etc.</p>

          <div className="flex flex-col gap-4">
            {customFields.map((field, index) => (
              <div key={index} className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase">Field Label</label>
                  <input
                    placeholder="e.g. VAT ID"
                    value={field.label}
                    onChange={(e) => updateCustomField(index, "label", e.target.value)}
                    className="bg-white border-[2px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] text-sm"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase">Value</label>
                  <input
                    placeholder="Value..."
                    value={field.value}
                    onChange={(e) => updateCustomField(index, "value", e.target.value)}
                    className="bg-white border-[2px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="w-full bg-red-100 border-[2px] border-black p-3 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Notes Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-[#f6f3ec] border-[3px] border-black p-8 shadow-[8px_8px_0_0_#000000]">
            <h3 className="font-display-md text-xl uppercase font-black mb-4 flex items-center gap-2">
              <ScrollText size={20} /> Additional Notes
            </h3>
            <textarea
              rows={5}
              placeholder="Terms and conditions, bank details, or thank you message..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border-[3px] border-black p-4 font-mono font-bold focus:outline-none focus:bg-[#FACC15] resize-none"
            />
          </div>

          <div className="bg-black text-white p-8 border-[3px] border-black shadow-[8px_8px_0_0_#FACC15]">
            <h3 className="font-display-md text-xl uppercase font-black mb-6 border-b border-white/20 pb-2 flex items-center gap-2">
              <Calculator size={20} className="text-[#FACC15]" /> Financial Summary
            </h3>
            <div className="flex flex-col gap-4 font-mono">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">SUBTOTAL</span>
                <span className="font-bold">${calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 flex items-center gap-1"><Percent size={12} /> TAX RATE</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-white/10 border border-white/30 text-right px-2 py-1 text-xs focus:outline-none focus:border-[#FACC15]"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 italic ml-2">Estimated Tax</span>
                  <span className="font-bold text-[#FACC15]">
                    + ${ (calculateSubtotal() * (taxRate / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 }) }
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-dashed border-white/20 flex justify-between items-center">
                <span className="font-black text-lg">TOTAL DUE</span>
                <span className="font-black text-3xl text-[#FACC15]">
                  ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end sticky bottom-8 z-10">
          <button
            type="submit"
            disabled={loading}
            className="group bg-[#FACC15] text-black border-[4px] border-black px-12 py-6 font-black text-2xl uppercase tracking-tighter flex items-center gap-4 shadow-[8px_8px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
          >
            {loading ? "COMMITTING TO LEDGER..." : (
               <>GENERATE & SAVE INVOICE <Save size={28} className="group-hover:rotate-12 transition-transform" /></>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}