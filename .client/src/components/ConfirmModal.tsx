import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000000] p-6"
        >
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-black hover:scale-110 transition-transform"
          >
            <X size={24} strokeWidth={3} />
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 border-[3px] border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000000] ${isDestructive ? 'bg-red-400' : 'bg-[#FACC15]'}`}>
              <AlertTriangle size={24} className="text-black" strokeWidth={2.5} />
            </div>
            <div className="pt-1">
              <h3 className="font-headline-md text-2xl uppercase font-black tracking-tighter leading-none mb-2">{title}</h3>
              <p className="font-body-md text-black/70 font-bold">{message}</p>
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-8 border-t-[3px] border-black pt-6">
            <button 
              onClick={onCancel}
              className="px-6 py-3 border-[3px] border-black font-label-caps uppercase font-black tracking-widest text-sm hover:bg-black/5 transition-colors shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`px-6 py-3 border-[3px] border-black font-label-caps uppercase font-black tracking-widest text-sm text-black transition-colors shadow-[2px_2px_0_0_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${isDestructive ? 'bg-red-400 hover:bg-red-500' : 'bg-[#FACC15] hover:bg-yellow-500'}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
