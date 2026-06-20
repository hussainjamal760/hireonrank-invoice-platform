"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Plus, Mail, Phone, MapPin, 
  Trash2, Pencil, X, Check, Search, ShieldAlert, CheckCircle2
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  createdAt: string;
}

export default function ClientsDirectory() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    targetId: string;
  }>({
    isOpen: false,
    targetId: ""
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", taxId: "", notes: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/clients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setClients(data.clients || []);
    } catch (err: any) {
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenPanel = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        taxId: client.taxId || "",
        notes: client.notes || ""
      });
    } else {
      setEditingClient(null);
      setFormData({ name: "", email: "", phone: "", address: "", taxId: "", notes: "" });
    }
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingClient(null);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const endpoint = editingClient ? `/api/clients/${editingClient._id}` : `/api/clients`;
      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save client");

      setSuccess(editingClient ? "Client updated successfully!" : "Client added successfully!");
      fetchClients();
      handleClosePanel();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (id: string) => {
    setModalState({ isOpen: true, targetId: id });
  };

  const executeDelete = async () => {
    const { targetId } = modalState;
    setModalState({ isOpen: false, targetId: "" });
    
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/clients/${targetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");
      setSuccess("Client deleted.");
      fetchClients();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12 relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Clients</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Manage your client directory for streamlined invoicing.</p>
        </div>
        <button 
          onClick={() => handleOpenPanel()}
          className="bg-[#FACC15] text-black border-[3px] border-black px-6 py-4 font-black uppercase text-sm flex items-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          <Plus size={20} /> Add Client
        </button>
      </motion.div>

      {/* Notifications */}
      {success && (
        <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00]">
          <CheckCircle2 size={24} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Controls */}
      <div className="bg-[#fbfbfa] border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000] flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-3.5 text-black/40" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-[3px] border-black font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
          />
        </div>
        <div className="font-label-caps font-bold text-sm text-black/60">
          {filteredClients.length} Client(s)
        </div>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full py-12 text-center">
             <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
               Loading Clients...
             </span>
           </div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-black/60 font-mono font-bold border-[3px] border-black border-dashed">
            No clients found. Click "Add Client" to get started.
          </div>
        ) : (
          filteredClients.map((client) => (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col justify-between group relative"
            >
              <div>
                <div className="w-12 h-12 bg-black text-[#FACC15] flex items-center justify-center font-display-md text-2xl font-black uppercase mb-4 shadow-[2px_2px_0_0_#FACC15]">
                  {client.name.charAt(0)}
                </div>
                <h3 className="font-display-md text-xl font-black uppercase mb-1">{client.name}</h3>
                
                <div className="flex flex-col gap-2 mt-4 font-mono text-sm">
                  <div className="flex items-center gap-2 text-black/80">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-black/80">
                      <Phone size={14} className="shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-black/80">
                      <MapPin size={14} className="shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t-[2px] border-black">
                <button
                  onClick={() => handleOpenPanel(client)}
                  className="flex-1 bg-white text-black border-[2px] border-black py-2 font-label-caps text-xs uppercase font-black shadow-[2px_2px_0_0_#000000] hover:bg-[#FACC15] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => requestDelete(client._id)}
                  className="bg-black text-white border-[2px] border-black p-2 shadow-[2px_2px_0_0_#000000] hover:bg-red-500 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  title="Delete Client"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePanel}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white border-l-[4px] border-black shadow-[-8px_0_0_0_#000000] flex flex-col"
            >
              <div className="p-6 border-b-[4px] border-black flex items-center justify-between bg-[#FACC15]">
                <h2 className="font-display-md text-2xl uppercase font-black flex items-center gap-2">
                  <Building2 size={24} /> {editingClient ? "Edit Client" : "New Client"}
                </h2>
                <button 
                  onClick={handleClosePanel}
                  className="bg-black text-white p-1 hover:opacity-80 transition-opacity"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {error && (
                  <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-3 font-bold text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps uppercase text-xs font-bold">Client/Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#fbfbfa] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps uppercase text-xs font-bold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#fbfbfa] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps uppercase text-xs font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#fbfbfa] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps uppercase text-xs font-bold">Billing Address</label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-[#fbfbfa] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps uppercase text-xs font-bold">Tax ID / VAT / GST</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    className="w-full bg-[#fbfbfa] border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:bg-[#FACC15]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps uppercase text-xs font-bold">Private Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Internal notes, payment preferences, etc."
                    className="w-full bg-[#fbfbfa] border-[3px] border-black p-3 font-mono font-bold text-sm focus:outline-none focus:bg-[#FACC15] resize-none"
                  />
                </div>

                <div className="mt-4 pb-12">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-black text-[#FACC15] hover:bg-[#FACC15] hover:text-black py-4 font-label-caps border-[3px] border-black transition-colors uppercase font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                  >
                    {isSaving ? "Saving..." : editingClient ? "Update Client" : "Save Client"} <Check size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={modalState.isOpen}
        title="Delete Client"
        message="Are you sure you want to delete this client?"
        onConfirm={executeDelete}
        onCancel={() => setModalState({ isOpen: false, targetId: "" })}
        isDestructive={true}
        confirmText="Yes, Delete"
      />
    </div>
  );
}
