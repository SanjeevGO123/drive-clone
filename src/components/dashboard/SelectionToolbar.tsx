import React from 'react';
import { Button } from '../ui/button';
import { Trash2, X } from 'lucide-react';

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
      <Button
        variant="destructive"
        onClick={handleDelete}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <Button
        variant="outline"
        onClick={clearSelection}
        className="flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
};

export default SelectionToolbar;
