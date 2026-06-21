"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, Shield, Mail, CreditCard, 
  Database, Server, Save, AlertTriangle, User, DollarSign
} from "lucide-react";

const InputField = ({ label, type = "text", placeholder, defaultValue, hint }: any) => (
  <div className="flex flex-col gap-2">
    <label className="font-label-caps text-xs uppercase font-bold tracking-widest text-black">
      {label}
    </label>
    <input 
      type={type} 
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="bg-white border-[3px] border-black px-4 py-3 text-black font-body-md focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_#000000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
    />
    {hint && <p className="text-black/60 text-xs font-bold mt-1">{hint}</p>}
  </div>
);

const ToggleSwitch = ({ label, description, defaultChecked }: any) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 p-4 border-[3px] border-black bg-white">
      <div>
        <h4 className="font-label-caps text-sm uppercase font-bold tracking-widest text-black mb-1">{label}</h4>
        <p className="text-black/60 text-xs font-bold leading-relaxed">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`relative w-14 h-8 shrink-0 border-[3px] border-black transition-colors duration-200 ${checked ? 'bg-[#FACC15]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-black border-[2px] border-black transition-all duration-200 ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
};

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  import("react").then(({ useEffect }) => {
    useEffect(() => {
      const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.preferredCurrency) {
              setPreferredCurrency(data.user.preferredCurrency);
            }
          }
        } catch (e) {}
      };
      fetchProfile();
    }, []);
  });

  const savePreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferredCurrency })
      });
      alert("Preferences saved successfully!");
    } catch (e) {
      alert("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "preferences", label: "Preferences", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing & APIs", icon: CreditCard },
    { id: "mail", label: "SMTP / Mail", icon: Mail },
    { id: "system", label: "System", icon: Server },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[4px] border-black pb-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-3 bg-white border-[2px] border-black inline-flex px-3 py-1 shadow-[2px_2px_0_0_#FACC15]">
            <SettingsIcon size={16} strokeWidth={3} className="text-black" />
            <span className="text-black font-label-caps text-xs tracking-widest uppercase font-black">Configuration</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl text-black uppercase font-black tracking-tighter">
            Platform Settings
          </h1>
        </div>
        <button onClick={activeTab === "preferences" ? savePreferences : undefined} disabled={loading} className="bg-emerald-400 text-black border-[3px] border-black px-8 py-3 font-label-caps text-sm tracking-widest uppercase font-black hover:bg-emerald-300 transition-colors shadow-[4px_4px_0_0_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-2">
          <Save size={18} strokeWidth={3} />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-4 px-4 py-4 border-[3px] border-black text-left transition-all
                  font-label-caps text-sm tracking-widest uppercase font-bold
                  ${isActive 
                    ? 'bg-[#FACC15] text-black shadow-[4px_4px_0_0_#000000]' 
                    : 'bg-white text-black/70 hover:bg-black hover:text-white'}
                `}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-[3px] border-black p-8 shadow-[8px_8px_0_0_#000000] flex flex-col gap-10"
          >
            {activeTab === "general" && (
              <>
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    Platform Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Platform Name" defaultValue="HireOnRank Invoice Platform" />
                    <InputField label="Support Email" defaultValue="support@hireonrank.com" />
                    <InputField label="Support Phone" defaultValue="+1 (555) 000-0000" />
                    <InputField label="Company Address" defaultValue="123 Startup Blvd, San Francisco, CA" />
                  </div>
                </div>

                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    Global Preferences
                  </h2>
                  <div className="flex flex-col gap-4">
                    <ToggleSwitch 
                      label="Enable New Company Registration" 
                      description="Allow new users to sign up and create companies on the platform."
                      defaultChecked={true}
                    />
                    <ToggleSwitch 
                      label="Maintenance Mode" 
                      description="Put the platform in maintenance mode. Only super admins can log in."
                      defaultChecked={false}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "preferences" && (
              <>
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    Personal Preferences
                  </h2>
                  <div className="flex flex-col gap-4 max-w-md">
                    <label className="font-label-caps uppercase text-xs font-bold text-black/60 flex items-center gap-2">
                      <DollarSign size={14} /> Dashboard Currency
                    </label>
                    <select
                      value={preferredCurrency}
                      onChange={(e) => setPreferredCurrency(e.target.value)}
                      className="bg-[#f6f3ec] border-[3px] border-black p-3 font-body-md focus:outline-none focus:bg-[#FACC15] font-bold"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="PKR">PKR - Pakistani Rupee</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                    <p className="text-black/60 text-xs font-bold mt-1">This currency will be used to display dashboard and analytics metrics.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <>
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    Authentication Rules
                  </h2>
                  <div className="flex flex-col gap-4">
                    <ToggleSwitch 
                      label="Force 2FA for all Super Admins" 
                      description="Require Two-Factor Authentication for all accounts with super admin privileges."
                      defaultChecked={true}
                    />
                    <ToggleSwitch 
                      label="Block suspicious IPs automatically" 
                      description="Automatically temporarily block IP addresses with too many failed login attempts."
                      defaultChecked={true}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Session Timeout (Minutes)" type="number" defaultValue="120" />
                    <InputField label="Max Login Attempts" type="number" defaultValue="5" />
                  </div>
                </div>
              </>
            )}

            {activeTab === "billing" && (
              <>
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    Payment Gateways (Stripe)
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    <InputField label="Stripe Public Key" type="password" defaultValue="pk_test_123456789" hint="Used for frontend tokenization." />
                    <InputField label="Stripe Secret Key" type="password" defaultValue="sk_test_123456789" hint="Keep this extremely secure. Never share." />
                    <InputField label="Webhook Secret" type="password" defaultValue="whsec_123456789" />
                  </div>
                </div>
              </>
            )}

            {activeTab === "mail" && (
              <>
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    SMTP Configuration
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="SMTP Host" defaultValue="smtp.sendgrid.net" />
                    <InputField label="SMTP Port" type="number" defaultValue="587" />
                    <InputField label="SMTP Username" defaultValue="apikey" />
                    <InputField label="SMTP Password" type="password" defaultValue="****************" />
                    <InputField label="From Email" defaultValue="noreply@hireonrank.com" />
                    <InputField label="From Name" defaultValue="HireOnRank Platform" />
                  </div>
                  <div className="mt-8">
                    <button className="bg-black text-white border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-[#FACC15] hover:text-black transition-colors shadow-[4px_4px_0_0_#000000]">
                      Send Test Email
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "system" && (
              <>
                <div>
                  <h2 className="font-display-md text-2xl uppercase font-black tracking-tight border-b-[3px] border-black pb-4 mb-6">
                    System Operations
                  </h2>
                  <div className="flex flex-col gap-6">
                    <div className="p-6 border-[3px] border-black bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black flex items-center justify-center text-white shrink-0">
                          <Database size={24} />
                        </div>
                        <div>
                          <h4 className="font-label-caps text-sm uppercase font-bold tracking-widest text-black">Clear System Cache</h4>
                          <p className="text-black/60 text-xs font-bold mt-1">Clears Redis cache. May cause temporary latency spike.</p>
                        </div>
                      </div>
                      <button className="bg-white text-black border-[3px] border-black px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_#000000]">
                        Clear Cache
                      </button>
                    </div>

                    <div className="p-6 border-[3px] border-red-500 bg-red-50 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 flex items-center justify-center text-white shrink-0">
                          <AlertTriangle size={24} strokeWidth={3} />
                        </div>
                        <div>
                          <h4 className="font-label-caps text-sm uppercase font-black tracking-widest text-red-600">Danger Zone</h4>
                          <p className="text-red-500/80 text-xs font-bold mt-1">Purge soft-deleted records older than 90 days.</p>
                        </div>
                      </div>
                      <button className="bg-red-500 text-white border-[3px] border-red-600 px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-black hover:bg-red-600 transition-colors shadow-[4px_4px_0_0_#DC2626]">
                        Purge Records
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
