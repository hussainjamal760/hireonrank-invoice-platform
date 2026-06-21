"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, UserPlus, Mail, Shield, Copy, Trash2, 
  CheckCircle2, ShieldAlert, Key, Clipboard, UploadCloud, FileSpreadsheet, XCircle
} from "lucide-react";
import * as XLSX from "xlsx";
import { ConfirmModal } from "@/components/ConfirmModal";
import { exportTableToCSV, exportTableToPDF } from "@/utils/tableExport";

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  createdAt: string;
}

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EMPLOYEE");
  const [inviteLoading, setInviteLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<"members" | "invites" | "batch">("members");

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    targetId: string;
    targetName?: string;
    type: 'cancelInvite' | 'removeMember' | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    targetId: "",
    type: null
  });

  // Batch Invite State
  const [parsedEmails, setParsedEmails] = useState<{ email: string; valid: boolean; reason?: string }[]>([]);
  const [batchRole, setBatchRole] = useState("EMPLOYEE");
  const [batchLoading, setBatchLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        // Flatten and extract emails
        let extracted: string[] = [];
        data.forEach(row => {
          row.forEach(cell => {
            if (typeof cell === 'string' && cell.includes('@')) {
              extracted.push(cell.trim().toLowerCase());
            }
          });
        });

        // Remove exact duplicates from the file itself
        extracted = Array.from(new Set(extracted));

        // Validate emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        const validated = extracted.map(email => {
          if (!emailRegex.test(email)) {
            return { email, valid: false, reason: "Invalid format" };
          }
          // Check if already member
          if (members.some(m => m.user?.email?.toLowerCase() === email)) {
            return { email, valid: false, reason: "Already a member" };
          }
          // Check if already invited
          if (invitations.some(inv => inv.email?.toLowerCase() === email)) {
            return { email, valid: false, reason: "Already invited" };
          }
          return { email, valid: true };
        });

        if (validated.length === 0) {
          setError("No emails found in the uploaded file.");
        } else {
          setParsedEmails(validated);
        }
      } catch (err: any) {
        setError("Error parsing the file. Please ensure it is a valid Excel or CSV file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBatchSend = async () => {
    const validEmails = parsedEmails.filter(p => p.valid).map(p => p.email);
    if (validEmails.length === 0) {
      return setError("No valid emails to send invitations to.");
    }

    setBatchLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/companies/invite/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emails: validEmails, role: batchRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send batch invitations");

      setSuccess(`Successfully sent ${data.results.successful.length} invitations. Failed: ${data.results.failed.length}`);
      setParsedEmails([]);
      fetchData(); // Refetch
    } catch (err: any) {
      setError(err.message || "Failed to send batch invitations");
    } finally {
      setBatchLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Fetch members
      const membersRes = await fetch("/api/companies/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const membersData = await membersRes.json();
      if (!membersRes.ok) throw new Error(membersData.message || "Failed to fetch members");
      setMembers(membersData.members || []);

      // Fetch invitations
      const invitesRes = await fetch("/api/companies/invitations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const invitesData = await invitesRes.json();
      // Since invitations require Owner/Admin, if it fails due to permissions (403), we can set empty list.
      if (invitesRes.ok) {
        setInvitations(invitesData.invitations || []);
      } else {
        setInvitations([]);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong fetching team details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteRole) {
      return setError("Please fill all the invitation details");
    }

    setInviteLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/companies/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send invitation");

      setSuccess(`Invitation sent successfully to ${inviteEmail}!`);
      setInviteEmail("");
      setInviteRole("EMPLOYEE");
      fetchData(); // Refetch
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const requestCancelInvite = (inviteId: string) => {
    setModalState({
      isOpen: true,
      title: "Cancel Invitation",
      message: "Are you sure you want to cancel this invitation?",
      targetId: inviteId,
      type: 'cancelInvite'
    });
  };

  const executeCancelInvite = async (inviteId: string) => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/companies/invitations/${inviteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel invitation");

      setSuccess("Invitation cancelled successfully!");
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to cancel invitation");
    }
  };

  const requestRemoveMember = (memberId: string, memberName: string) => {
    setModalState({
      isOpen: true,
      title: "Remove Member",
      message: `Are you sure you want to remove ${memberName} from this company?`,
      targetId: memberId,
      targetName: memberName,
      type: 'removeMember'
    });
  };

  const executeRemoveMember = async (memberId: string, memberName: string) => {
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/companies/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove member");

      setSuccess(`Successfully removed ${memberName} from the company.`);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    }
  };

  const handleModalConfirm = () => {
    const { type, targetId, targetName } = modalState;
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (type === 'cancelInvite') {
      executeCancelInvite(targetId);
    } else if (type === 'removeMember') {
      executeRemoveMember(targetId, targetName || 'User');
    }
  };

  const handleCopyLink = (inviteToken: string) => {
    const inviteLink = `${window.location.origin}/login?invite_token=${inviteToken}`;
    navigator.clipboard.writeText(inviteLink);
    setSuccess("Invitation link copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Metrics
  const activeMembersCount = members.length;
  const pendingInvitesCount = invitations.length;
  const adminCount = members.filter((m) => m.role === "OWNER" || m.role === "ADMIN").length;

  const handleExportCSV = () => {
    if (activeTab === "members") {
      const data = members.map(m => ({
        Name: m.user?.name || "Uninitialized",
        Email: m.user?.email || "N/A",
        Role: m.role,
        Joined: new Date(m.createdAt).toLocaleDateString()
      }));
      exportTableToCSV(data, "Active_Members_Report");
    } else if (activeTab === "invites") {
      const data = invitations.map(i => ({
        Email: i.email,
        "Invited As": i.role,
        "Date Sent": new Date(i.createdAt).toLocaleDateString()
      }));
      exportTableToCSV(data, "Pending_Invites_Report");
    }
  };

  const handleExportPDF = () => {
    if (activeTab === "members") {
      const headers = ["Name", "Email", "Role", "Joined"];
      const data = members.map(m => [
        m.user?.name || "Uninitialized",
        m.user?.email || "N/A",
        m.role,
        new Date(m.createdAt).toLocaleDateString()
      ]);
      exportTableToPDF("Active Members Directory", headers, data, "Active_Members_Report");
    } else if (activeTab === "invites") {
      const headers = ["Email", "Invited As", "Date Sent"];
      const data = invitations.map(i => [
        i.email,
        i.role,
        new Date(i.createdAt).toLocaleDateString()
      ]);
      exportTableToPDF("Pending Invitations", headers, data, "Pending_Invites_Report");
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <h1 className="font-display-lg text-5xl md:text-6xl text-black uppercase font-black tracking-tighter">Team Control</h1>
          <p className="font-body-md text-on-surface-variant font-bold mt-2">Manage employee permissions, company roles, and team onboarding.</p>
        </div>
      </motion.div>

      {/* Toast Notifications */}
      {error && (
        <div className="bg-[#FFE5E5] text-[#D32F2F] border-[3px] border-[#D32F2F] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#D32F2F]">
          <ShieldAlert size={24} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#E5F6E5] text-[#008A00] border-[3px] border-[#008A00] p-4 font-bold flex items-center gap-3 shadow-[4px_4px_0_0_#008A00]">
          <CheckCircle2 size={24} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Users size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Active Members</h3>
            <div className="font-display-lg text-4xl text-black font-black">{activeMembersCount}</div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <Key size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Privileged Admins</h3>
            <div className="font-display-lg text-4xl text-black font-black">{adminCount}</div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white border-[2px] border-black flex items-center justify-center text-black shadow-[2px_2px_0_0_#000000]">
              <UserPlus size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-black/60 font-label-caps uppercase text-xs tracking-widest mb-1 font-bold">Pending Invites</h3>
            <div className="font-display-lg text-4xl text-black font-black">{pendingInvitesCount}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Invite Form */}
        <div className="w-full lg:w-4/12">
          <div className="bg-white border-[3px] border-black p-6 shadow-[4px_4px_0_0_#FACC15]">
            <h2 className="font-display-md text-2xl uppercase font-black mb-6 border-b-[2px] border-black pb-2 flex items-center gap-2">
              <UserPlus size={20} /> Invite Member
            </h2>

            <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background text-xs font-bold">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="email@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-[#f6f3ec] text-[#1c1c18] border-[3px] border-on-background pl-10 pr-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-[#facc15] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                  />
                  <Mail className="absolute left-3 top-3.5 text-black/50" size={18} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-caps uppercase text-on-background text-xs font-bold">Company Role</label>
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    required
                    className="w-full bg-[#f6f3ec] text-[#1c1c18] border-[3px] border-on-background pl-10 pr-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:bg-[#facc15] focus:translate-x-[2px] focus:translate-y-[2px] transition-all appearance-none cursor-pointer"
                  >
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                  <Shield className="absolute left-3 top-3.5 text-black/50" size={18} />
                </div>
              </div>

              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full bg-black text-white py-3.5 font-label-caps border-[3px] border-black hover:bg-[#FACC15] hover:text-black transition-colors uppercase font-black flex items-center justify-center gap-2 mt-2 shadow-[3px_3px_0_0_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
              >
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Members & Invites Tables */}
        <div className="w-full lg:w-8/12">
          <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0_0_#000000]">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row border-b-[3px] border-black mb-6 justify-between items-start sm:items-center">
              <div className="flex flex-wrap border-r-[3px] sm:border-r-0 border-black sm:border-none">
                <button
                  onClick={() => setActiveTab("members")}
                  className={`px-6 py-3 font-label-caps uppercase font-bold text-sm tracking-wider border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-black transition-all ${
                    activeTab === "members"
                      ? "bg-[#FACC15] text-black"
                      : "bg-white text-black/60 hover:bg-[#FACC15]/20"
                  }`}
                >
                  Active Members ({activeMembersCount})
                </button>
                <button
                  onClick={() => setActiveTab("invites")}
                  className={`px-6 py-3 font-label-caps uppercase font-bold text-sm tracking-wider border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-black transition-all ${
                    activeTab === "invites"
                      ? "bg-[#FACC15] text-black"
                      : "bg-white text-black/60 hover:bg-[#FACC15]/20"
                  }`}
                >
                  Pending Invitations ({pendingInvitesCount})
                </button>
                <button
                  onClick={() => setActiveTab("batch")}
                  className={`px-6 py-3 font-label-caps uppercase font-bold text-sm tracking-wider border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-black transition-all ${
                    activeTab === "batch"
                      ? "bg-[#FACC15] text-black"
                      : "bg-white text-black/60 hover:bg-[#FACC15]/20"
                  }`}
                >
                  Batch Invite
                </button>
              </div>
              {(activeTab === "members" || activeTab === "invites") && (
                <div className="flex gap-2 p-3 sm:p-0 sm:pr-4">
                  <button 
                    onClick={handleExportCSV}
                    className="bg-white text-black border-[2px] border-black px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    CSV
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="bg-[#FACC15] text-black border-[2px] border-black px-3 py-1 font-label-caps text-xs font-black shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    PDF
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <span className="font-label-caps text-lg uppercase tracking-widest text-[#735c00] animate-pulse">
                  Querying Organization Ledger...
                </span>
              </div>
            ) : activeTab === "members" ? (
              members.length === 0 ? (
                <div className="py-8 text-center text-black/60 font-bold font-mono">
                  No active company members found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                        <th className="p-4 border-r-[2px] border-black">Member</th>
                        <th className="p-4 border-r-[2px] border-black">Email</th>
                        <th className="p-4 border-r-[2px] border-black">Role</th>
                        <th className="p-4 border-r-[2px] border-black">Joined</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-[#FACC15]/10 text-black">
                          <td className="p-4 border-r-[2px] border-black font-bold flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none border-[2px] border-black bg-surface-container flex items-center justify-center text-xs font-black shadow-[1px_1px_0_0_#000000]">
                              {member.user?.name ? member.user.name.substring(0, 2).toUpperCase() : "??"}
                            </div>
                            <span>{member.user?.name || "Uninitialized"}</span>
                          </td>
                          <td className="p-4 border-r-[2px] border-black font-bold text-xs">{member.user?.email || "N/A"}</td>
                          <td className="p-4 border-r-[2px] border-black">
                            <span className="bg-[#e2e2e2] text-black border-[2px] border-black px-2 py-0.5 text-xs font-black">
                              {member.role}
                            </span>
                          </td>
                          <td className="p-4 border-r-[2px] border-black font-bold text-xs">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => requestRemoveMember(member.id, member.user?.name || "User")}
                              className="text-red-600 hover:text-red-500 hover:scale-110 transition-transform bg-transparent border-0 cursor-pointer"
                              title="Remove Member"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === "invites" ? (
              invitations.length === 0 ? (
                <div className="py-8 text-center text-black/60 font-bold font-mono">
                  No pending invitations found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#FACC15] border-b-[3px] border-black font-label-caps text-xs uppercase font-black text-black">
                        <th className="p-4 border-r-[2px] border-black">Email</th>
                        <th className="p-4 border-r-[2px] border-black">Invited As</th>
                        <th className="p-4 border-r-[2px] border-black">Date Sent</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                      {invitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#FACC15]/10 text-black">
                          <td className="p-4 border-r-[2px] border-black font-bold text-xs">{inv.email}</td>
                          <td className="p-4 border-r-[2px] border-black">
                            <span className="bg-[#e2e2e2] text-black border-[2px] border-black px-2 py-0.5 text-xs font-black">
                              {inv.role}
                            </span>
                          </td>
                          <td className="p-4 border-r-[2px] border-black font-bold text-xs">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-center flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleCopyLink(inv.token)}
                              className="text-blue-600 hover:text-blue-500 hover:scale-110 transition-transform bg-transparent border-0 cursor-pointer"
                              title="Copy Invitation Link"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              onClick={() => requestCancelInvite(inv.id)}
                              className="text-red-600 hover:text-red-500 hover:scale-110 transition-transform bg-transparent border-0 cursor-pointer"
                              title="Cancel Invitation"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === "batch" ? (
              <div className="flex flex-col gap-6">
                <div className="border-[3px] border-dashed border-black bg-[#f6f3ec] p-8 text-center flex flex-col items-center justify-center gap-4 relative">
                  <FileSpreadsheet size={48} className="text-black/50" />
                  <div>
                    <h3 className="font-headline-md text-xl uppercase font-black">Upload Spreadsheet</h3>
                    <p className="font-body-md text-black/60 font-bold">Accepts .xlsx and .csv files.</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-black text-white px-6 py-2 font-label-caps uppercase font-black text-sm shadow-[2px_2px_0_0_#FACC15]">
                    Browse Files
                  </div>
                </div>

                {parsedEmails.length > 0 && (
                  <div className="mt-4 border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000000]">
                    <div className="flex justify-between items-center p-4 border-b-[3px] border-black bg-[#f6f3ec]">
                      <div className="font-headline-md font-black uppercase flex items-center gap-2">
                        <Users size={18} /> Preview Emails
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={batchRole}
                          onChange={(e) => setBatchRole(e.target.value)}
                          className="bg-white border-[2px] border-black px-3 py-1 font-label-caps uppercase text-xs font-bold focus:outline-none"
                        >
                          <option value="EMPLOYEE">Role: Employee</option>
                        
                        </select>
                        <button
                          onClick={handleBatchSend}
                          disabled={batchLoading || parsedEmails.filter(p => p.valid).length === 0}
                          className="bg-[#FACC15] text-black border-[2px] border-black px-4 py-1.5 font-label-caps uppercase text-xs font-black hover:bg-black hover:text-[#FACC15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {batchLoading ? "Sending..." : `Send ${parsedEmails.filter(p => p.valid).length} Invites`}
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full border-collapse text-left">
                        <tbody className="divide-y-[1px] divide-black font-mono text-sm">
                          {parsedEmails.map((item, idx) => (
                            <tr key={idx} className={item.valid ? "bg-[#E5F6E5]/30 text-black" : "bg-[#FFE5E5]/30 text-black"}>
                              <td className="p-3 font-bold border-r-[2px] border-black w-10 text-center">
                                {item.valid ? <CheckCircle2 size={18} className="text-[#008A00]" /> : <XCircle size={18} className="text-[#D32F2F]" />}
                              </td>
                              <td className={`p-3 font-bold border-r-[2px] border-black ${item.valid ? "text-black" : "text-[#D32F2F] line-through"}`}>
                                {item.email}
                              </td>
                              <td className="p-3 font-bold text-xs uppercase">
                                {item.valid ? <span className="text-[#008A00]">Valid</span> : <span className="text-[#D32F2F]">{item.reason}</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        isDestructive={true}
        confirmText="Yes, Proceed"
      />
    </div>
  );
}
