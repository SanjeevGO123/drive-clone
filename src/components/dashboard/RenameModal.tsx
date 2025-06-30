import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Check } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter new file name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm();
              if (e.key === 'Escape') onCancel();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="btn-liquid-glass-gray">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex items-center gap-2 btn-liquid-glass-blue">
            <Check className="h-4 w-4" />
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;
