import React from 'react';
import { motion } from 'framer-motion';
import { Plus, SlidersHorizontal } from 'lucide-react';

interface BottomDockProps {
  onAddTask: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  userPhoto?: string | null;
  userInitial?: string;
}

const IconButton: React.FC<{ 
    children: React.ReactNode; 
    'aria-label': string; 
    onClick?: () => void;
}> = ({ children, 'aria-label': ariaLabel, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, transition: { duration: 0.2, ease: "easeOut" } }}
        whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
        aria-label={ariaLabel}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
    >
        {children}
    </motion.button>
);

export const BottomDock: React.FC<BottomDockProps> = ({ 
    onAddTask, 
    onOpenSettings, 
    onOpenProfile,
    userPhoto,
    userInitial = 'G'
}) => {
  return (
    <motion.div
      initial={{ y: 100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ type: "tween", duration: 0.4, ease: "easeOut", delay: 0.2 }}
      className="fixed left-1/2 z-50 p-2 bg-zinc-200/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md rounded-full flex items-center gap-3 shadow-2xl shadow-black/20 border border-zinc-300 dark:border-zinc-800"
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
      }}
    >
        <IconButton 
            aria-label="Settings" 
            onClick={onOpenSettings}
        >
            <SlidersHorizontal size={20} />
        </IconButton>

        <motion.button
            onClick={onAddTask}
            whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            aria-label="Add New Task"
            className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-black dark:text-white shadow-lg relative border border-zinc-200 dark:border-zinc-700"
        >
            <Plus size={28} strokeWidth={2.5} />
        </motion.button>

        <motion.button
            onClick={onOpenProfile}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-zinc-300 dark:bg-zinc-700/50 flex items-center justify-center overflow-hidden border border-transparent hover:border-zinc-400 dark:hover:border-zinc-500 transition-all shadow-inner"
        >
             {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                    {userInitial.toUpperCase()}
                </span>
            )}
        </motion.button>
    </motion.div>
  );
};