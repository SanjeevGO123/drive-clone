import React from 'react';

// RenameModal component handles the modal for renaming files.
// Props:
// - isOpen: Boolean to control modal visibility.
// - value: Current value of the input field.
// - onChange: Function to handle input changes.
// - onConfirm: Function to confirm the rename action.
// - onCancel: Function to cancel the rename action.

type RenameModalProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  value,
  onChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
      <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl max-w-md w-full p-10 border border-gray-200 dark:border-gray-700 animate-fade-in backdrop-blur-xl">
        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
          Rename File
        </h3>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 mb-6 text-lg shadow-sm"
          placeholder="Enter new file name"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-full bg-gray-100/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200/80 dark:hover:bg-gray-600/80 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold hover:from-blue-600 hover:to-emerald-600 focus:ring-2 focus:ring-blue-400 shadow transition active:scale-95 flex items-center gap-2"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;
