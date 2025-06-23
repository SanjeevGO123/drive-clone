import React from 'react';

type ConfirmModalProps = {
  isOpen: boolean;
  type: 'file' | 'folder' | null;
  name: string;
  onConfirm: (() => void) | null;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type,
  name,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-10 w-full max-w-md border border-gray-200 dark:border-gray-700 animate-fade-in backdrop-blur-xl">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
          Confirm Delete
        </h3>
        <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg">
          Are you sure you want to delete this <span className="capitalize font-semibold">{type}</span>? <span className="font-bold text-gray-900 dark:text-gray-100">{name}</span>?
          {type === 'folder' && (
            <span className="block text-xs text-red-500 mt-2">All files inside will be deleted.</span>
          )}
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-6 py-2 rounded-full bg-gray-100/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200/80 dark:hover:bg-gray-600/80 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 focus:ring-2 focus:ring-red-400 shadow transition active:scale-95 flex items-center gap-2"
            onClick={() => { onCancel(); onConfirm && onConfirm(); }}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
