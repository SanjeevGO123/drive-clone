import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

// ConfirmModal component handles the confirmation dialog for deleting files or folders.
// Props:
// - isOpen: Boolean to control modal visibility.
// - type: Type of item being deleted ('file' or 'folder').
// - name: Name of the item being deleted.
// - onConfirm: Callback for confirming the action.
// - onCancel: Callback for canceling the action.

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            Confirm Delete
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this <span className="capitalize font-semibold">{type}</span>{' '}
            <span className="font-bold">{name}</span>?
            {type === 'folder' && (
              <span className="block text-xs text-destructive mt-2">
                All files inside will be deleted.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onCancel();
              onConfirm && onConfirm();
            }}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
