"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Save, Copy, RotateCcw, Eye, Upload as UploadIcon,
  FileText, Trash2, Plus, Star, Grip, X, Check, ChevronDown, ChevronUp,
  Building2, User, Hash, Table2, Receipt, Percent, StickyNote,
  ScrollText, PenTool, CreditCard, QrCode, Footprints,
  Palette, Type, LayoutGrid, Layers, ImageIcon, Phone,
  Globe, MapPin, ZoomIn, ZoomOut, Sparkles, Crown,
  Settings2, ToggleLeft, ToggleRight, ChevronRight
} from "lucide-react";

interface TemplateSection {
  id: string;
  type: string;
  label: string;
  icon: string;
  visible: boolean;
  order: number;
  column?: string;
}

interface Branding {
  logoUrl: string;
  companyName: string;
  companyAddress: string;
  website: string;
  phone: string;
  defaultNotes: string;
  defaultTerms: string;
}

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface Typography {
  fontFamily: string;
  headingSize: number;
  bodySize: number;
  fontWeight: string;
}

interface LayoutSettings {
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

interface SavedTemplate {
  _id: string;
  name: string;
  theme: string;
  isDefault: boolean;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
  branding: Branding;
  themeSettings: ThemeSettings;
  typography: Typography;
  layout: LayoutSettings;
  sections: TemplateSection[];
}

const THEME_PRESETS: Record<string, { label: string; primary: string; secondary: string; accent: string; bg: string; text: string }> = {
  'modern-corporate': { label: 'Modern Corporate', primary: '#2563EB', secondary: '#1E293B', accent: '#3B82F6', bg: '#FFFFFF', text: '#0F172A' },
  'minimal-clean': { label: 'Minimal Clean', primary: '#18181B', secondary: '#71717A', accent: '#A1A1AA', bg: '#FAFAFA', text: '#18181B' },
  'professional-blue': { label: 'Professional Blue', primary: '#1E40AF', secondary: '#1E3A5F', accent: '#60A5FA', bg: '#F0F4FF', text: '#1E293B' },
  'dark-elegant': { label: 'Dark Elegant', primary: '#F59E0B', secondary: '#FBBF24', accent: '#D97706', bg: '#111827', text: '#F9FAFB' },
  'startup-style': { label: 'Startup Style', primary: '#8B5CF6', secondary: '#6D28D9', accent: '#A78BFA', bg: '#FAF5FF', text: '#1F2937' },
  'financial-premium': { label: 'Financial Premium', primary: '#047857', secondary: '#065F46', accent: '#34D399', bg: '#F0FDF4', text: '#064E3B' },
};

const DEFAULT_SECTIONS: TemplateSection[] = [
  { id: 'company-logo', type: 'company-logo', label: 'Company Logo', icon: 'ImageIcon', visible: true, order: 0, column: 'sidebar' },
  { id: 'company-info', type: 'company-info', label: 'Company Information', icon: 'Building2', visible: true, order: 1, column: 'sidebar' },
  { id: 'client-info', type: 'client-info', label: 'Client Information', icon: 'User', visible: true, order: 2, column: 'sidebar' },
  { id: 'invoice-header', type: 'invoice-header', label: 'Invoice Header', icon: 'Hash', visible: true, order: 3, column: 'main' },
  { id: 'items-table', type: 'items-table', label: 'Invoice Items Table', icon: 'Table2', visible: true, order: 4, column: 'main' },
  { id: 'tax-section', type: 'tax-section', label: 'Tax Section', icon: 'Receipt', visible: true, order: 5, column: 'main' },
  { id: 'discount-section', type: 'discount-section', label: 'Discount Section', icon: 'Percent', visible: false, order: 6, column: 'main' },
  { id: 'notes', type: 'notes', label: 'Notes', icon: 'StickyNote', visible: true, order: 7, column: 'main' },
  { id: 'terms', type: 'terms', label: 'Terms & Conditions', icon: 'ScrollText', visible: false, order: 8, column: 'main' },
  { id: 'signature', type: 'signature', label: 'Signature Area', icon: 'PenTool', visible: false, order: 9, column: 'main' },
  { id: 'payment-info', type: 'payment-info', label: 'Payment Information', icon: 'CreditCard', visible: true, order: 10, column: 'sidebar' },
  { id: 'qr-code', type: 'qr-code', label: 'QR Code', icon: 'QrCode', visible: false, order: 11, column: 'sidebar' },
  { id: 'footer', type: 'footer', label: 'Footer', icon: 'Footprints', visible: true, order: 12, column: 'main' },
];

const ICON_MAP: Record<string, any> = {
  ImageIcon, Building2, User, Hash, Table2, Receipt, Percent,
  StickyNote, ScrollText, PenTool, CreditCard, QrCode, Footprints
};

const SAMPLE_DATA = {
  invoiceNumber: 'INV-202606-0042',
  issueDate: 'June 20, 2026',
  dueDate: 'July 20, 2026',
  company: {
    name: 'Radical Ledger Inc.',
    address: '123 Finance District, Suite 400\nNew York, NY 10005',
    website: 'www.radicalledger.com',
    phone: '+1 (555) 987-6543',
    logo: '',
  },
  client: {
    name: 'Acme Corporation',
    email: 'billing@acmecorp.com',
    address: '456 Commerce Ave, Floor 12\nSan Francisco, CA 94105',
  },
  items: [
    { description: 'Premium Software License (Annual)', quantity: 2, unitPrice: 4999.00, amount: 9998.00 },
    { description: 'Implementation & Setup Services', quantity: 40, unitPrice: 175.00, amount: 7000.00 },
    { description: 'Dedicated Support Package (6 months)', quantity: 1, unitPrice: 2500.00, amount: 2500.00 },
    { description: 'Data Migration & Integration', quantity: 1, unitPrice: 3200.00, amount: 3200.00 },
  ],
  subtotal: 22698.00,
  taxRate: 8.5,
  taxAmount: 1929.33,
  discount: 500.00,
  total: 24127.33,
  notes: 'Thank you for your business. Payment is expected within 30 days of invoice date.',
  terms: 'Late payments are subject to a 1.5% monthly interest charge. All sales are final.',
  paymentInfo: {
    bankName: 'First National Bank',
    accountName: 'Radical Ledger Inc.',
    accountNumber: '****-****-****-4821',
    routingNumber: '021000089',
  },
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -30, x: '-50%' }}
      className="fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0_0_#000]"
      style={{
        backgroundColor: type === 'success' ? '#E5F6E5' : '#FFE5E5',
        color: type === 'success' ? '#008A00' : '#D32F2F',
      }}
    >
      {type === 'success' ? <Check size={18} /> : <X size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-60">
        <X size={14} />
      </button>
    </motion.div>
  );
}

function getThemeColors(theme: string, themeSettings: ThemeSettings) {
  const preset = THEME_PRESETS[theme] || THEME_PRESETS['modern-corporate'];
  return {
    primary: themeSettings.primaryColor || preset.primary,
    secondary: themeSettings.secondaryColor || preset.secondary,
    accent: themeSettings.accentColor || preset.accent,
    bg: preset.bg,
    text: preset.text,
  };
}

const InlineText = ({ value = "", onChange, style, multiline = false, placeholder = "Type here..." }: any) => {
  const Element = multiline ? 'textarea' : 'input';
  const safeValue = value || "";
  return (
    <Element
      value={safeValue}
      onChange={(e: any) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={multiline ? safeValue.split('\n').length : undefined}
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        width: '100%',
        resize: 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        color: 'inherit',
        textAlign: 'inherit',
        padding: 0,
        margin: 0,
        ...style
      }}
      onClick={(e: any) => e.stopPropagation()}
    />
  );
};

export default function InvoiceDesignerPage() {
  const router = useRouter();

  const [templateName, setTemplateName] = useState("Untitled Template");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>("modern-corporate");
  const [sections, setSections] = useState<TemplateSection[]>([...DEFAULT_SECTIONS]);
  const [branding, setBranding] = useState<Branding>({
    logoUrl: '', companyName: 'Radical Ledger Inc.', companyAddress: '123 Finance District, Suite 400\nNew York, NY 10005', website: 'www.radicalledger.com', phone: '+1 (555) 987-6543', defaultNotes: SAMPLE_DATA.notes, defaultTerms: SAMPLE_DATA.terms
  });
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    primaryColor: '#2563EB', secondaryColor: '#1E293B', accentColor: '#3B82F6'
  });
  const [typography, setTypography] = useState<Typography>({
    fontFamily: 'Inter', headingSize: 24, bodySize: 14, fontWeight: 'normal'
  });
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    headerStyle: 'standard', footerStyle: 'standard', sectionSpacing: 16, borderRadius: 0, tableStyle: 'bordered', pageMargins: 40, structure: 'standard', watermark: false, backgroundPattern: 'none'
  });

  const [zoom, setZoom] = useState(75);
  const [activeCanvasSection, setActiveCanvasSection] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<string>('branding');
  const [showPreview, setShowPreview] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<{ logo: string, name: string, address: string, phone: string, website: string } | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const getToken = () => localStorage.getItem("token");

  const decodeCompanyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      return decoded.currentCompanyId;
    } catch {
      return null;
    }
  };

  const fetchTemplates = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/invoice-templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSavedTemplates(data.templates || []);
    } catch {}
  }, []);

  const fetchCurrentCompany = useCallback(async () => {
    const token = getToken();
    const currentCompanyId = decodeCompanyId();
    if (!token || !currentCompanyId) return;

    try {
      const res = await fetch(`/api/company/${currentCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.company) {
        setCompanyData({
          logo: data.company.logo || '',
          name: data.company.name || '',
          address: data.company.address || '',
          phone: data.company.phone || '',
          website: data.company.website || ''
        });
        
        setBranding(prev => ({
          ...prev,
          logoUrl: data.company.logo || prev.logoUrl || '',
          companyName: prev.companyName === 'Radical Ledger Inc.' ? data.company.name : prev.companyName,
          companyAddress: prev.companyAddress === '123 Finance District, Suite 400\nNew York, NY 10005' && data.company.address ? data.company.address : prev.companyAddress
        }));
      }
    } catch {}
  }, []);

  useEffect(() => { 
    fetchTemplates(); 
    fetchCurrentCompany();
  }, [fetchTemplates, fetchCurrentCompany]);

  const handleSave = async () => {
    setSaving(true);
    const token = getToken();
    if (!token) return;

    const payload = {
      name: templateName,
      theme: activeTheme,
      sections,
      branding,
      themeSettings,
      typography,
      layout: layoutSettings,
    };

    try {
      let res;
      if (currentTemplateId) {
        res = await fetch(`/api/invoice-templates/${currentTemplateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/invoice-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');

      setCurrentTemplateId(data.template._id);
      setToast({ message: 'Template saved successfully!', type: 'success' });
      fetchTemplates();
    } catch (err: any) {
      setToast({ message: err.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    setCurrentTemplateId(null);
    setTemplateName(`${templateName} (Copy)`);
    setTimeout(() => handleSave(), 100);
  };

  const handleDuplicate = async () => {
    if (!currentTemplateId) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/invoice-templates/${currentTemplateId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToast({ message: 'Template duplicated!', type: 'success' });
      fetchTemplates();
    } catch (err: any) {
      setToast({ message: err.message || 'Duplicate failed', type: 'error' });
    }
  };

  const handleReset = () => {
    setSections([...DEFAULT_SECTIONS]);
    setActiveTheme('modern-corporate');
    const preset = THEME_PRESETS['modern-corporate'];
    setThemeSettings({ primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent });
    setTypography({ fontFamily: 'Inter', headingSize: 24, bodySize: 14, fontWeight: 'normal' });
    setLayoutSettings({ headerStyle: 'standard', footerStyle: 'standard', sectionSpacing: 16, borderRadius: 0, tableStyle: 'bordered', pageMargins: 40 });
    setBranding({ logoUrl: '', companyName: 'Radical Ledger Inc.', companyAddress: '123 Finance District, Suite 400\nNew York, NY 10005', website: 'www.radicalledger.com', phone: '+1 (555) 987-6543' });
    setCurrentTemplateId(null);
    setTemplateName('Untitled Template');
    setToast({ message: 'Template reset to defaults', type: 'success' });
  };

  const handlePublish = async () => {
    if (!currentTemplateId) {
      await handleSave();
    }
    const token = getToken();
    if (!token || !currentTemplateId) return;

    try {
      const res = await fetch(`/api/invoice-templates/${currentTemplateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPublished: true })
      });
      if (!res.ok) throw new Error('Publish failed');
      setToast({ message: 'Template published!', type: 'success' });
      fetchTemplates();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/invoice-templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      if (currentTemplateId === id) {
        setCurrentTemplateId(null);
        setTemplateName('Untitled Template');
      }
      setToast({ message: 'Template deleted', type: 'success' });
      fetchTemplates();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/invoice-templates/${id}/default`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Set default failed');
      setToast({ message: 'Default template updated!', type: 'success' });
      fetchTemplates();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const loadTemplate = (template: SavedTemplate) => {
    setCurrentTemplateId(template._id);
    setTemplateName(template.name);
    setActiveTheme(template.theme);
    const restoredSections = template.sections?.length 
      ? template.sections.map((s: any) => {
          const defaultSec = DEFAULT_SECTIONS.find(ds => ds.id === s.id);
          return { ...s, label: defaultSec?.label || s.type, icon: defaultSec?.icon || 'FileText' };
        })
      : [...DEFAULT_SECTIONS];
    setSections(restoredSections);
    setBranding(template.branding || { logoUrl: '', companyName: '', companyAddress: '', website: '', phone: '' });
    setThemeSettings(template.themeSettings || { primaryColor: '#2563EB', secondaryColor: '#1E293B', accentColor: '#3B82F6' });
    setTypography(template.typography || { fontFamily: 'Inter', headingSize: 24, bodySize: 14, fontWeight: 'normal' });
    setLayoutSettings(template.layout || { headerStyle: 'standard', footerStyle: 'standard', sectionSpacing: 16, borderRadius: 0, tableStyle: 'bordered', pageMargins: 40 });
    setToast({ message: `Loaded "${template.name}"`, type: 'success' });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s));
  };

  const applyTheme = (themeKey: string) => {
    setActiveTheme(themeKey);
    const preset = THEME_PRESETS[themeKey];
    if (preset) {
      setThemeSettings({ primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent });
    }
  };

  const handleSidebarDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
    setDragOverColumn('sidebar-list');
  };

  const handleSidebarDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedSection) return;

    setSections(prev => {
      const newSections = [...prev];
      const fromIndex = newSections.findIndex(s => s.id === draggedSection);
      if (fromIndex === -1) return prev;

      const [moved] = newSections.splice(fromIndex, 1);
      newSections.splice(targetIndex, 0, moved);
      return newSections.map((s, i) => ({ ...s, order: i }));
    });

    setDraggedSection(null);
    setDragOverIndex(null);
    setDragOverColumn(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent, index: number, column: string = 'main') => {
    e.preventDefault();
    setDragOverIndex(index);
    setDragOverColumn(column);
  };

  const handleCanvasDrop = (e: React.DragEvent, targetIndex: number, targetColumn: string = 'main') => {
    e.preventDefault();
    if (!draggedSection) return;

    setSections(prev => {
      const newSections = [...prev];
      const fromIndex = newSections.findIndex(s => s.id === draggedSection);
      if (fromIndex === -1) return prev;

      const [moved] = newSections.splice(fromIndex, 1);
      moved.visible = true;
      moved.column = targetColumn;
      
      const columnSections = newSections.filter(s => s.column === targetColumn);
      const insertIdx = newSections.findIndex(s => s.id === columnSections[targetIndex]?.id);
      
      if (insertIdx !== -1) {
        newSections.splice(insertIdx, 0, moved);
      } else {
        newSections.push(moved);
      }
      
      return newSections.map((s, i) => ({ ...s, order: i }));
    });

    setDraggedSection(null);
    setDragOverIndex(null);
    setDragOverColumn(null);
  };

  const colors = getThemeColors(activeTheme, themeSettings);
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

  const RIGHT_TABS = [
    { key: 'branding', label: 'Branding', icon: Building2 },
    { key: 'theme', label: 'Theme', icon: Palette },
    { key: 'typography', label: 'Type', icon: Type },
    { key: 'layout', label: 'Layout', icon: LayoutGrid },
    { key: 'sections', label: 'Sections', icon: Layers },
    { key: 'themes', label: 'Themes', icon: Sparkles },
  ];

  const getBackgroundStyle = () => {
    const base: any = { background: colors.bg };
    if (layoutSettings.backgroundPattern === 'dots') {
      base.backgroundImage = `radial-gradient(${colors.secondary}20 1px, transparent 1px)`;
      base.backgroundSize = '20px 20px';
    } else if (layoutSettings.backgroundPattern === 'grid') {
      base.backgroundImage = `linear-gradient(to right, ${colors.secondary}10 1px, transparent 1px), linear-gradient(to bottom, ${colors.secondary}10 1px, transparent 1px)`;
      base.backgroundSize = '20px 20px';
    } else if (layoutSettings.backgroundPattern === 'waves') {
      base.backgroundImage = `repeating-radial-gradient( circle at 0 0, transparent 0, ${colors.bg} 10px, ${colors.secondary}05 10px, ${colors.secondary}05 20px )`;
    }
    return base;
  };

  const renderCanvasSection = (section: TemplateSection) => {
    const isActive = activeCanvasSection === section.id;
    const sectionStyle: React.CSSProperties = {
      marginBottom: layoutSettings.sectionSpacing,
      borderRadius: layoutSettings.borderRadius,
      cursor: 'pointer',
      border: isActive ? `2px dashed ${colors.primary}` : '2px solid transparent',
      padding: '12px',
      transition: 'all 0.15s ease',
      fontSize: typography.bodySize,
      fontFamily: typography.fontFamily,
    };

    const headingStyle: React.CSSProperties = {
      fontSize: typography.headingSize,
      fontWeight: typography.fontWeight === 'bold' ? 700 : typography.fontWeight === 'light' ? 300 : 400,
      color: colors.text,
      fontFamily: typography.fontFamily,
    };

    switch (section.type) {
      case 'company-logo':
        const displayLogo = branding.logoUrl || companyData?.logo;
        return (
          <motion.div layoutId={`section-${section.id}`} style={sectionStyle} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 160, height: 48, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 2, borderRadius: layoutSettings.borderRadius }}>
                {branding.companyName?.split(' ').map(w => w[0]).join('').slice(0, 3) || 'LOGO'}
              </div>
            )}
          </motion.div>
        );

      case 'company-info':
        return (
          <motion.div layoutId={`section-${section.id}`} style={sectionStyle} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <InlineText
              value={branding.companyName}
              onChange={(val: string) => setBranding({...branding, companyName: val})}
              style={{ fontWeight: 700, fontSize: typography.headingSize * 0.7, color: colors.text }}
            />
            <InlineText
              multiline
              value={branding.companyAddress}
              onChange={(val: string) => setBranding({...branding, companyAddress: val})}
              style={{ color: colors.secondary, fontSize: typography.bodySize - 1, marginTop: 2, lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: typography.bodySize - 2, color: colors.secondary }}>
              <InlineText
                value={branding.phone}
                onChange={(val: string) => setBranding({...branding, phone: val})}
                placeholder="Phone Number"
                style={{ width: 'auto' }}
              />
              <InlineText
                value={branding.website}
                onChange={(val: string) => setBranding({...branding, website: val})}
                placeholder="Website"
                style={{ width: 'auto' }}
              />
            </div>
          </motion.div>
        );

      case 'client-info':
        return (
          <motion.div layoutId={`section-${section.id}`} style={sectionStyle} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ fontSize: typography.bodySize - 2, textTransform: 'uppercase', fontWeight: 700, color: colors.primary, letterSpacing: 1, marginBottom: 4 }}>Bill To</div>
            <div style={{ fontWeight: 600, color: colors.text }}>{SAMPLE_DATA.client.name}</div>
            <div style={{ color: colors.secondary, fontSize: typography.bodySize - 1 }}>{SAMPLE_DATA.client.email}</div>
            <div style={{ color: colors.secondary, fontSize: typography.bodySize - 1, whiteSpace: 'pre-line' }}>{SAMPLE_DATA.client.address}</div>
          </motion.div>
        );

      case 'invoice-header':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div>
              <div style={{ ...headingStyle, fontSize: typography.headingSize * 1.2 }}>INVOICE</div>
              <div style={{ color: colors.primary, fontWeight: 700, fontSize: typography.bodySize, fontFamily: 'JetBrains Mono, monospace' }}>{SAMPLE_DATA.invoiceNumber}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: typography.bodySize - 1, color: colors.secondary }}>
              <div><span style={{ fontWeight: 600 }}>Issue Date:</span> {SAMPLE_DATA.issueDate}</div>
              <div><span style={{ fontWeight: 600 }}>Due Date:</span> {SAMPLE_DATA.dueDate}</div>
            </div>
          </motion.div>
        );

      case 'items-table':
        const tableRadius = layoutSettings.borderRadius;
        const isBordered = layoutSettings.tableStyle === 'bordered';
        const isStriped = layoutSettings.tableStyle === 'striped';
        return (
          <motion.div layoutId={`section-${section.id}`} style={sectionStyle} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typography.bodySize - 1, borderRadius: tableRadius, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: colors.primary, color: '#fff' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, borderRight: isBordered ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, borderRight: isBordered ? '1px solid rgba(255,255,255,0.2)' : 'none', width: 60 }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, borderRight: isBordered ? '1px solid rgba(255,255,255,0.2)' : 'none', width: 100 }}>Unit Price</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, width: 100 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.items.map((item, i) => (
                  <tr key={i} style={{ background: isStriped && i % 2 === 1 ? `${colors.primary}10` : 'transparent', borderBottom: isBordered ? `1px solid ${colors.secondary}20` : 'none' }}>
                    <td style={{ padding: '8px 10px', color: colors.text }}>{item.description}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', color: colors.text }}>{item.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: colors.text }}>${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: colors.text }}>${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        );

      case 'tax-section':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.secondary, fontSize: typography.bodySize - 1 }}>
                <span>Subtotal</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>${SAMPLE_DATA.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.secondary, fontSize: typography.bodySize - 1 }}>
                <span>Tax ({SAMPLE_DATA.taxRate}%)</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${SAMPLE_DATA.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </motion.div>
        );

      case 'discount-section':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ width: 260, display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontSize: typography.bodySize - 1 }}>
              <span>Discount</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>-${SAMPLE_DATA.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </motion.div>
        );

      case 'notes':
        return (
          <motion.div layoutId={`section-${section.id}`} style={sectionStyle} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ fontSize: typography.bodySize - 2, textTransform: 'uppercase', fontWeight: 700, color: colors.primary, letterSpacing: 1, marginBottom: 4 }}>Notes</div>
            <InlineText
              multiline
              value={branding.defaultNotes}
              onChange={(val: string) => setBranding({...branding, defaultNotes: val})}
              style={{ color: colors.secondary, fontSize: typography.bodySize - 1, lineHeight: 1.5 }}
            />
          </motion.div>
        );

      case 'terms':
        return (
          <motion.div layoutId={`section-${section.id}`} style={sectionStyle} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ fontSize: typography.bodySize - 2, textTransform: 'uppercase', fontWeight: 700, color: colors.primary, letterSpacing: 1, marginBottom: 4 }}>Terms & Conditions</div>
            <InlineText
              multiline
              value={branding.defaultTerms}
              onChange={(val: string) => setBranding({...branding, defaultTerms: val})}
              style={{ color: colors.secondary, fontSize: typography.bodySize - 2, lineHeight: 1.5 }}
            />
          </motion.div>
        );

      case 'signature':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', marginTop: 20 }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ width: '45%' }}>
              <div style={{ borderBottom: `2px solid ${colors.secondary}30`, height: 50 }}></div>
              <div style={{ fontSize: typography.bodySize - 2, color: colors.secondary, marginTop: 4 }}>Authorized Signature</div>
            </div>
            <div style={{ width: '45%' }}>
              <div style={{ borderBottom: `2px solid ${colors.secondary}30`, height: 50 }}></div>
              <div style={{ fontSize: typography.bodySize - 2, color: colors.secondary, marginTop: 4 }}>Date</div>
            </div>
          </motion.div>
        );

      case 'payment-info':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, background: `${colors.primary}08`, padding: 16, borderRadius: layoutSettings.borderRadius }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ fontSize: typography.bodySize - 2, textTransform: 'uppercase', fontWeight: 700, color: colors.primary, letterSpacing: 1, marginBottom: 8 }}>Payment Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: typography.bodySize - 2, color: colors.secondary }}>
              <span style={{ fontWeight: 600 }}>Bank:</span><span>{SAMPLE_DATA.paymentInfo.bankName}</span>
              <span style={{ fontWeight: 600 }}>Account:</span><span>{SAMPLE_DATA.paymentInfo.accountName}</span>
              <span style={{ fontWeight: 600 }}>Acc #:</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{SAMPLE_DATA.paymentInfo.accountNumber}</span>
              <span style={{ fontWeight: 600 }}>Routing:</span><span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{SAMPLE_DATA.paymentInfo.routingNumber}</span>
            </div>
          </motion.div>
        );

      case 'qr-code':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ width: 72, height: 72, background: colors.text, borderRadius: layoutSettings.borderRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <QrCode size={48} color={colors.bg} />
            </div>
            <div style={{ fontSize: typography.bodySize - 2, color: colors.secondary }}>
              Scan to pay or view invoice details online.
            </div>
          </motion.div>
        );

      case 'footer':
        return (
          <motion.div layoutId={`section-${section.id}`} style={{ ...sectionStyle, borderTop: `2px solid ${colors.primary}30`, paddingTop: 12, textAlign: 'center' }} onClick={() => setActiveCanvasSection(section.id)} key={section.id}>
            <div style={{ fontSize: typography.bodySize - 3, color: colors.secondary }}>
              {branding.companyName || SAMPLE_DATA.company.name} • {branding.website || SAMPLE_DATA.company.website} • {branding.phone || SAMPLE_DATA.company.phone}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderTotalBar = () => {
    const hasTax = sections.find(s => s.type === 'tax-section' && s.visible);
    const hasDiscount = sections.find(s => s.type === 'discount-section' && s.visible);
    if (!hasTax && !hasDiscount) return null;

    return (
      <motion.div layout style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: layoutSettings.sectionSpacing }}>
        <div style={{
          width: 260,
          padding: '12px 16px',
          background: colors.primary,
          color: '#fff',
          borderRadius: layoutSettings.borderRadius,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 800,
          fontSize: typography.headingSize * 0.75,
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <span>TOTAL</span>
          <span>${SAMPLE_DATA.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] -m-6 sm:-m-8 lg:-m-12 overflow-hidden">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="bg-white border-b-[3px] border-black px-4 py-3 flex items-center gap-3 flex-wrap shrink-0 z-20">
        <button
          onClick={() => router.push('/accountant-dashboard/invoices')}
          className="bg-white text-black border-[3px] border-black px-3 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="h-8 w-[3px] bg-black hidden md:block" />

        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="bg-[#f6f3ec] border-[3px] border-black px-4 py-2 font-mono font-bold text-sm focus:outline-none focus:bg-[#FACC15] w-52 transition-colors"
          placeholder="Template Name..."
        />

        <button onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
          className={`border-[3px] border-black px-3 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${isTemplatesOpen ? 'bg-black text-[#FACC15]' : 'bg-white text-black'}`}>
          <FileText size={14} /> Templates {isTemplatesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button onClick={handleSave} disabled={saving}
            className="bg-[#FACC15] text-black border-[3px] border-black px-4 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleSaveAsNew}
            className="bg-white text-black border-[3px] border-black px-3 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <Copy size={14} /> Save As
          </button>
          {currentTemplateId && (
            <button onClick={handleDuplicate}
              className="bg-white text-black border-[3px] border-black px-3 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <Copy size={14} /> Duplicate
            </button>
          )}
          <button onClick={handleReset}
            className="bg-white text-black border-[3px] border-black px-3 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={() => setShowPreview(true)}
            className="bg-black text-[#FACC15] border-[3px] border-black px-4 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#FACC15] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <Eye size={14} /> Preview
          </button>
          <button onClick={handlePublish}
            className="bg-black text-white border-[3px] border-black px-4 py-2 font-black uppercase text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <UploadIcon size={14} /> Publish
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[240px] bg-[#fbfbfa] border-r-[3px] border-black overflow-y-auto shrink-0 hidden lg:block">
          <div className="px-4 py-3 border-b-[2px] border-black bg-black text-[#FACC15]">
            <h3 className="font-label-caps uppercase text-[10px] font-black tracking-widest flex items-center gap-2">
              <Layers size={14} /> Template Components
            </h3>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {sections.map((section, index) => {
              const IconComponent = ICON_MAP[section.icon] || FileText;
              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => setDraggedSection(section.id)}
                  onDragEnd={() => { setDraggedSection(null); setDragOverIndex(null); setDragOverColumn(null); }}
                  onDragOver={(e) => handleSidebarDragOver(e, index)}
                  onDrop={(e) => handleSidebarDrop(e, index)}
                  style={{
                    borderTop: dragOverIndex === index && dragOverColumn === 'sidebar-list' ? '3px dashed black' : ''
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 border-[2px] border-black cursor-grab active:cursor-grabbing transition-all text-[11px] font-black uppercase group ${
                    section.visible
                      ? 'bg-white shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
                      : 'bg-[#f0eee7] text-black/40 border-dashed'
                  }`}
                >
                  <Grip size={12} className="text-black/30 shrink-0" />
                  <IconComponent size={14} className={section.visible ? 'text-[#FACC15]' : 'text-black/20'} />
                  <span className="flex-1 truncate">{section.label}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
                    className="shrink-0 opacity-60 hover:opacity-100"
                  >
                    {section.visible ? <ToggleRight size={16} className="text-[#008A00]" /> : <ToggleLeft size={16} className="text-black/30" />}
                  </button>
                </div>
              );
            })}
            <div 
              onDragOver={(e) => handleSidebarDragOver(e, sections.length)}
              onDrop={(e) => handleSidebarDrop(e, sections.length)}
              style={{ height: 20, borderTop: dragOverIndex === sections.length && dragOverColumn === 'sidebar-list' ? '3px dashed black' : '3px solid transparent' }} 
            />
          </div>
        </aside>

        <main className="flex-1 bg-[#e5e2db] overflow-auto flex flex-col items-center py-6 px-4 relative">
          <div className="flex items-center gap-2 mb-4 bg-white border-[3px] border-black px-3 py-1.5 shadow-[3px_3px_0_0_#000]">
            <ZoomOut size={14} />
            {[50, 75, 100, 125].map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-2 py-1 text-[10px] font-black uppercase border-[2px] border-black transition-all ${
                  zoom === z ? 'bg-[#FACC15] shadow-[1px_1px_0_0_#000]' : 'bg-white hover:bg-[#f6f3ec]'
                }`}
              >
                {z}%
              </button>
            ))}
            <ZoomIn size={14} />
          </div>

          <div
            ref={canvasRef}
            className="origin-top transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div
              style={{
                width: layoutSettings.structure === 'receipt' ? 400 : 794,
                minHeight: layoutSettings.structure === 'receipt' ? 600 : 1123,
                ...getBackgroundStyle(),
                color: colors.text,
                padding: layoutSettings.pageMargins,
                fontFamily: layoutSettings.structure === 'receipt' ? '"JetBrains Mono", monospace' : typography.fontFamily,
                fontSize: typography.bodySize,
                boxShadow: '0 4px 40px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                margin: layoutSettings.structure === 'receipt' ? '0 auto' : undefined
              }}
            >
              {layoutSettings.watermark && (branding.logoUrl || companyData?.logo) && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
                  <img src={branding.logoUrl || companyData?.logo} style={{ width: 400, height: 400, objectFit: 'contain' }} alt="watermark" />
                </div>
              )}

              {layoutSettings.structure === 'creative' && (
                <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: colors.primary, borderRadius: '50%', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
              )}
              {layoutSettings.structure === 'creative' && (
                <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: colors.accent, borderRadius: '20%', transform: 'rotate(45deg)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {layoutSettings.structure === 'sidebar' ? (
                  <div style={{ display: 'flex', gap: 32 }}>
                    <div style={{ width: 240, background: `${colors.primary}0A`, padding: 20, borderRadius: layoutSettings.borderRadius, minHeight: '100%' }}>
                      {visibleSections.filter(s => s.column === 'sidebar').map((section, index) => (
                        <div
                          key={section.id}
                          onDragOver={(e) => handleCanvasDragOver(e, index, 'sidebar')}
                          onDrop={(e) => handleCanvasDrop(e, index, 'sidebar')}
                          style={{
                            borderTop: dragOverIndex === index && dragOverColumn === 'sidebar' ? `3px dashed ${colors.primary}` : '3px solid transparent',
                            transition: 'border 0.15s ease',
                          }}
                        >
                          {renderCanvasSection(section)}
                        </div>
                      ))}
                      <div 
                        onDragOver={(e) => handleCanvasDragOver(e, visibleSections.filter(s => s.column === 'sidebar').length, 'sidebar')}
                        onDrop={(e) => handleCanvasDrop(e, visibleSections.filter(s => s.column === 'sidebar').length, 'sidebar')}
                        style={{ height: 40, borderTop: dragOverIndex === visibleSections.filter(s => s.column === 'sidebar').length && dragOverColumn === 'sidebar' ? `3px dashed ${colors.primary}` : '3px solid transparent' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      {visibleSections.filter(s => s.column !== 'sidebar').map((section, index) => (
                        <div
                          key={section.id}
                          onDragOver={(e) => handleCanvasDragOver(e, index, 'main')}
                          onDrop={(e) => handleCanvasDrop(e, index, 'main')}
                          style={{
                            borderTop: dragOverIndex === index && dragOverColumn === 'main' ? `3px dashed ${colors.primary}` : '3px solid transparent',
                            transition: 'border 0.15s ease',
                          }}
                        >
                          {renderCanvasSection(section)}
                        </div>
                      ))}
                      <div 
                        onDragOver={(e) => handleCanvasDragOver(e, visibleSections.filter(s => s.column !== 'sidebar').length, 'main')}
                        onDrop={(e) => handleCanvasDrop(e, visibleSections.filter(s => s.column !== 'sidebar').length, 'main')}
                        style={{ height: 40, borderTop: dragOverIndex === visibleSections.filter(s => s.column !== 'sidebar').length && dragOverColumn === 'main' ? `3px dashed ${colors.primary}` : '3px solid transparent' }} 
                      />
                      {renderTotalBar()}
                    </div>
                  </div>
                ) : (
                  <div>
                    {visibleSections.map((section, index) => (
                      <div
                        key={section.id}
                        onDragOver={(e) => handleCanvasDragOver(e, index, 'main')}
                        onDrop={(e) => handleCanvasDrop(e, index, 'main')}
                        style={{
                          borderTop: dragOverIndex === index && (!dragOverColumn || dragOverColumn === 'main') ? `3px dashed ${colors.primary}` : '3px solid transparent',
                          transition: 'border 0.15s ease',
                        }}
                      >
                        {renderCanvasSection(section)}
                      </div>
                    ))}
                    <div 
                      onDragOver={(e) => handleCanvasDragOver(e, visibleSections.length, 'main')}
                      onDrop={(e) => handleCanvasDrop(e, visibleSections.length, 'main')}
                      style={{ height: 40, borderTop: dragOverIndex === visibleSections.length && (!dragOverColumn || dragOverColumn === 'main') ? `3px dashed ${colors.primary}` : '3px solid transparent' }} 
                    />
                    {renderTotalBar()}
                  </div>
                )}
              </div>

              {visibleSections.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center" style={{ color: colors.secondary }}>
                  <Layers size={48} style={{ opacity: 0.3 }} />
                  <p className="mt-4 font-bold text-lg">No Sections Added</p>
                  <p className="text-sm opacity-60 mt-1">Drag components from the left sidebar or toggle sections on</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="w-[320px] bg-white border-l-[3px] border-black overflow-y-auto shrink-0 hidden xl:block">
          <div className="flex border-b-[2px] border-black overflow-x-auto no-scrollbar">
            {RIGHT_TABS.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setRightTab(tab.key)}
                  className={`flex-1 min-w-0 px-2 py-3 text-[9px] font-black uppercase text-center border-r-[1px] border-black last:border-r-0 transition-colors flex flex-col items-center gap-1 ${
                    rightTab === tab.key ? 'bg-[#FACC15] text-black' : 'bg-white text-black/60 hover:bg-[#f6f3ec]'
                  }`}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4">
            {rightTab === 'branding' && (
              <div className="flex flex-col gap-4">
                <h4 className="font-label-caps uppercase text-[10px] font-black border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <Building2 size={14} className="text-[#FACC15]" /> Branding
                </h4>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Building2 size={11} /> Company Name</label>
                  <input
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><MapPin size={11} /> Address</label>
                  <textarea
                    rows={2}
                    value={branding.companyAddress}
                    onChange={(e) => setBranding({ ...branding, companyAddress: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] transition-colors resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Globe size={11} /> Website</label>
                  <input
                    value={branding.website}
                    onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase flex items-center gap-1"><Phone size={11} /> Phone</label>
                  <input
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] transition-colors"
                  />
                </div>
              </div>
            )}

            {rightTab === 'theme' && (
              <div className="flex flex-col gap-4">
                <h4 className="font-label-caps uppercase text-[10px] font-black border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <Palette size={14} className="text-[#FACC15]" /> Theme Settings
                </h4>
                {[
                  { key: 'primaryColor' as const, label: 'Primary Color' },
                  { key: 'secondaryColor' as const, label: 'Secondary Color' },
                  { key: 'accentColor' as const, label: 'Accent Color' },
                ].map(item => (
                  <div key={item.key} className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeSettings[item.key]}
                        onChange={(e) => setThemeSettings({ ...themeSettings, [item.key]: e.target.value })}
                        className="w-10 h-10 border-[2px] border-black cursor-pointer p-0"
                      />
                      <input
                        value={themeSettings[item.key]}
                        onChange={(e) => setThemeSettings({ ...themeSettings, [item.key]: e.target.value })}
                        className="flex-1 bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] transition-colors uppercase"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rightTab === 'typography' && (
              <div className="flex flex-col gap-4">
                <h4 className="font-label-caps uppercase text-[10px] font-black border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <Type size={14} className="text-[#FACC15]" /> Typography
                </h4>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Font Family</label>
                  <select
                    value={typography.fontFamily}
                    onChange={(e) => setTypography({ ...typography, fontFamily: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                  >
                    {['Inter', 'Fraunces', 'JetBrains Mono', 'Roboto', 'Poppins', 'Georgia', 'Arial'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Heading Size: {typography.headingSize}px</label>
                  <input
                    type="range"
                    min={16}
                    max={40}
                    value={typography.headingSize}
                    onChange={(e) => setTypography({ ...typography, headingSize: parseInt(e.target.value) })}
                    className="w-full accent-[#FACC15]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Body Size: {typography.bodySize}px</label>
                  <input
                    type="range"
                    min={10}
                    max={20}
                    value={typography.bodySize}
                    onChange={(e) => setTypography({ ...typography, bodySize: parseInt(e.target.value) })}
                    className="w-full accent-[#FACC15]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Font Weight</label>
                  <div className="flex gap-2">
                    {['light', 'normal', 'bold'].map(w => (
                      <button
                        key={w}
                        onClick={() => setTypography({ ...typography, fontWeight: w })}
                        className={`flex-1 py-2 text-[10px] font-black uppercase border-[2px] border-black transition-all ${
                          typography.fontWeight === w ? 'bg-[#FACC15] shadow-[2px_2px_0_0_#000]' : 'bg-white hover:bg-[#f6f3ec]'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'layout' && (
              <div className="flex flex-col gap-4">
                <h4 className="font-label-caps uppercase text-[10px] font-black border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <LayoutGrid size={14} className="text-[#FACC15]" /> Layout Controls
                </h4>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Layout Structure</label>
                  <select
                    value={layoutSettings.structure}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, structure: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                  >
                    <option value="standard">Standard (1 Column)</option>
                    <option value="sidebar">Sidebar Split</option>
                    <option value="receipt">Receipt (Narrow)</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Background Pattern</label>
                  <select
                    value={layoutSettings.backgroundPattern}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, backgroundPattern: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                  >
                    <option value="none">Solid Color</option>
                    <option value="dots">Dots</option>
                    <option value="grid">Grid</option>
                    <option value="waves">Waves</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase">Logo Watermark</label>
                  <button onClick={() => setLayoutSettings({ ...layoutSettings, watermark: !layoutSettings.watermark })}>
                    {layoutSettings.watermark
                      ? <ToggleRight size={22} className="text-[#008A00]" />
                      : <ToggleLeft size={22} className="text-black/30" />
                    }
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Header Style</label>
                  <select
                    value={layoutSettings.headerStyle}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, headerStyle: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                  >
                    <option value="standard">Standard</option>
                    <option value="centered">Centered</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Footer Style</label>
                  <select
                    value={layoutSettings.footerStyle}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, footerStyle: e.target.value })}
                    className="bg-[#f6f3ec] border-[2px] border-black p-2.5 font-mono font-bold text-xs focus:outline-none focus:bg-[#FACC15] cursor-pointer"
                  >
                    <option value="standard">Standard</option>
                    <option value="centered">Centered</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Section Spacing: {layoutSettings.sectionSpacing}px</label>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    value={layoutSettings.sectionSpacing}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, sectionSpacing: parseInt(e.target.value) })}
                    className="w-full accent-[#FACC15]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Border Radius: {layoutSettings.borderRadius}px</label>
                  <input
                    type="range"
                    min={0}
                    max={16}
                    value={layoutSettings.borderRadius}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-[#FACC15]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Table Style</label>
                  <div className="flex gap-2">
                    {['bordered', 'striped', 'minimal'].map(s => (
                      <button
                        key={s}
                        onClick={() => setLayoutSettings({ ...layoutSettings, tableStyle: s })}
                        className={`flex-1 py-2 text-[10px] font-black uppercase border-[2px] border-black transition-all ${
                          layoutSettings.tableStyle === s ? 'bg-[#FACC15] shadow-[2px_2px_0_0_#000]' : 'bg-white hover:bg-[#f6f3ec]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase">Page Margins: {layoutSettings.pageMargins}px</label>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={layoutSettings.pageMargins}
                    onChange={(e) => setLayoutSettings({ ...layoutSettings, pageMargins: parseInt(e.target.value) })}
                    className="w-full accent-[#FACC15]"
                  />
                </div>
              </div>
            )}

            {rightTab === 'sections' && (
              <div className="flex flex-col gap-4">
                <h4 className="font-label-caps uppercase text-[10px] font-black border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <Layers size={14} className="text-[#FACC15]" /> Section Visibility
                </h4>
                {sections.map(section => {
                  const IconComponent = ICON_MAP[section.icon] || FileText;
                  return (
                    <div key={section.id} className="flex items-center justify-between py-2 border-b border-black/10">
                      <div className="flex items-center gap-2">
                        <IconComponent size={14} className={section.visible ? 'text-black' : 'text-black/30'} />
                        <span className={`text-[11px] font-bold uppercase ${section.visible ? '' : 'text-black/40'}`}>{section.label}</span>
                      </div>
                      <button onClick={() => toggleSectionVisibility(section.id)}>
                        {section.visible
                          ? <ToggleRight size={22} className="text-[#008A00]" />
                          : <ToggleLeft size={22} className="text-black/30" />
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {rightTab === 'themes' && (
              <div className="flex flex-col gap-4">
                <h4 className="font-label-caps uppercase text-[10px] font-black border-b-[2px] border-black pb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FACC15]" /> Invoice Themes
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => applyTheme(key)}
                      className={`flex flex-col border-[2px] border-black overflow-hidden transition-all ${
                        activeTheme === key ? 'shadow-[3px_3px_0_0_#FACC15] ring-2 ring-[#FACC15]' : 'shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
                      }`}
                    >
                      <div style={{ background: preset.bg, padding: 8, height: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <div style={{ width: 20, height: 6, background: preset.primary, borderRadius: 1 }} />
                          <div style={{ width: 30, height: 6, background: preset.secondary, borderRadius: 1, opacity: 0.3 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <div style={{ flex: 1, height: 3, background: preset.secondary, borderRadius: 1, opacity: 0.15 }} />
                          <div style={{ flex: 1, height: 3, background: preset.secondary, borderRadius: 1, opacity: 0.15 }} />
                          <div style={{ width: 16, height: 3, background: preset.primary, borderRadius: 1 }} />
                        </div>
                        <div style={{ width: '100%', height: 12, background: preset.primary, borderRadius: 1, opacity: 0.15 }} />
                      </div>
                      <div className="bg-white px-2 py-1.5 text-[9px] font-black uppercase text-center border-t-[2px] border-black flex items-center justify-center gap-1">
                        {activeTheme === key && <Check size={10} className="text-[#008A00]" />}
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {isTemplatesOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="bg-white border-t-[3px] border-black p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-label-caps uppercase text-[11px] font-black flex items-center gap-2">
                  <FileText size={14} className="text-[#FACC15]" /> Saved Templates
                </h3>
                <span className="text-[10px] font-mono font-bold text-black/40">{savedTemplates.length} template{savedTemplates.length !== 1 ? 's' : ''}</span>
              </div>

              {savedTemplates.length === 0 ? (
                <div className="text-center py-6 border-[2px] border-dashed border-black/20">
                  <Layers size={28} className="mx-auto text-black/20 mb-2" />
                  <p className="text-xs font-bold text-black/40">No templates yet. Design your first template and save it!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {savedTemplates.map(t => {
                    const tPreset = THEME_PRESETS[t.theme] || THEME_PRESETS['modern-corporate'];
                    return (
                      <div key={t._id} className="border-[2px] border-black bg-white shadow-[3px_3px_0_0_#000] group relative">
                        <div style={{ background: tPreset.bg, height: 60, padding: 8, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                            <div style={{ width: 14, height: 4, background: tPreset.primary, borderRadius: 1 }} />
                            <div style={{ width: 24, height: 4, background: tPreset.secondary, borderRadius: 1, opacity: 0.3 }} />
                          </div>
                          <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                            <div style={{ flex: 1, height: 2, background: tPreset.secondary, opacity: 0.1 }} />
                            <div style={{ flex: 1, height: 2, background: tPreset.secondary, opacity: 0.1 }} />
                          </div>
                          <div style={{ width: '60%', height: 8, background: tPreset.primary, borderRadius: 1, opacity: 0.2 }} />
                          {t.isDefault && (
                            <div className="absolute top-1 right-1 bg-[#FACC15] border-[1px] border-black px-1 py-0.5">
                              <Star size={8} className="text-black" />
                            </div>
                          )}
                        </div>
                        <div className="p-2 border-t-[2px] border-black">
                          <div className="text-[10px] font-black uppercase truncate">{t.name}</div>
                          <div className="text-[8px] font-mono text-black/40 mt-0.5">{new Date(t.updatedAt).toLocaleDateString()}</div>
                          <div className="text-[8px] font-bold uppercase mt-1 px-1 py-0.5 border-[1px] border-black/20 inline-block" style={{ color: tPreset.primary }}>
                            {tPreset.label}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                          <button onClick={() => loadTemplate(t)}
                            className="bg-[#FACC15] text-black border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] hover:shadow-none transition-all">
                            Edit
                          </button>
                          <button onClick={() => handleSetDefault(t._id)}
                            className="bg-white text-black border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] hover:shadow-none transition-all">
                            Default
                          </button>
                          <button onClick={() => handleDeleteTemplate(t._id)}
                            className="bg-red-500 text-white border-[2px] border-black px-2 py-1 text-[8px] font-black uppercase shadow-[1px_1px_0_0_#000] hover:shadow-none transition-all">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-auto py-8"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-4 -right-4 bg-[#FACC15] text-black border-[3px] border-black w-10 h-10 flex items-center justify-center font-black shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-10"
              >
                <X size={18} />
              </button>

              <div
                style={{
                  width: layoutSettings.structure === 'receipt' ? 400 : 794,
                  minHeight: layoutSettings.structure === 'receipt' ? 600 : 1123,
                  ...getBackgroundStyle(),
                  color: colors.text,
                  padding: layoutSettings.pageMargins,
                  fontFamily: layoutSettings.structure === 'receipt' ? '"JetBrains Mono", monospace' : typography.fontFamily,
                  fontSize: typography.bodySize,
                  boxShadow: '0 4px 40px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {layoutSettings.watermark && (branding.logoUrl || companyData?.logo) && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
                    <img src={branding.logoUrl || companyData?.logo} style={{ width: 400, height: 400, objectFit: 'contain' }} alt="watermark" />
                  </div>
                )}
                {layoutSettings.structure === 'creative' && (
                  <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: colors.primary, borderRadius: '50%', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
                )}
                {layoutSettings.structure === 'creative' && (
                  <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: colors.accent, borderRadius: '20%', transform: 'rotate(45deg)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {layoutSettings.structure === 'sidebar' ? (
                    <div style={{ display: 'flex', gap: 32 }}>
                      <div style={{ width: 240, background: `${colors.primary}0A`, padding: 20, borderRadius: layoutSettings.borderRadius, minHeight: '100%' }}>
                        {visibleSections.filter(s => s.column === 'sidebar').map(section => renderCanvasSection(section))}
                      </div>
                      <div style={{ flex: 1 }}>
                        {visibleSections.filter(s => s.column !== 'sidebar').map(section => renderCanvasSection(section))}
                        {renderTotalBar()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {visibleSections.map(section => renderCanvasSection(section))}
                      {renderTotalBar()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}