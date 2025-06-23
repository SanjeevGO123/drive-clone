import React from 'react';

// SelectionToolbar component displays actions for selected items.
// Props:
// - selectedCount: Number of selected items.
// - handleDelete: Function to delete selected items.
// - clearSelection: Function to clear the selection.

type SelectionToolbarProps = {
  selectedCount: number;
  handleDelete: () => void;
  clearSelection: () => void;
};

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  handleDelete,
  clearSelection,
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="flex items-center gap-2 px-8 py-2 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700 sticky top-[72px] z-10 rounded-b-xl shadow-md animate-fade-in">
      <span className="text-blue-700 dark:text-blue-300 font-medium">{selectedCount} selected</span>
      <button
        className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 shadow-md transition active:scale-95 font-semibold"
        onClick={handleDelete}
      >
        <span className="text-lg font-bold mr-1">🗑️</span> Delete
      </button>
      <button
        className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-400 shadow-md transition active:scale-95 font-semibold"
        onClick={clearSelection}
      >
        Cancel
      </button>
    </div>
  );
};

export default SelectionToolbar;
