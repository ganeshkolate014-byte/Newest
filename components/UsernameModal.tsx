import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Check } from 'lucide-react';
import { updateUserProfileName } from '../utils/firebase';

interface UsernameModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
        await updateUserProfileName(name.trim());
        onSuccess();
    } catch (error) {
        console.error("Failed to update name", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl p-8 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] pointer-events-none" />
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white">
                        <UserIcon size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Who are you?</h2>
                    <p className="text-zinc-400 text-sm">Pick a display name to start chatting with the community.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        autoFocus 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. DesignWizard"
                        maxLength={20}
                        className="w-full h-14 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 text-white placeholder-zinc-500 outline-none focus:border-blue-500 focus:bg-zinc-800 transition-all text-center text-lg font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!name.trim() || loading}
                        className="w-full h-14 bg-white text-black rounded-xl font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Updating...' : <>Continue <Check size={18} /></>}
                    </button>
                </form>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};