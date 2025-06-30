import React from 'react';
import { Button } from '../ui/button';
import { Trash2, X, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 btn-liquid-glass-blue">
            <MoreHorizontal className="h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={handleDelete} className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4 text-destructive-foreground" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={clearSelection} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SelectionToolbar;
