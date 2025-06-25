import React from 'react';
import { useToast } from '../../hooks/use-toast';

// Toast component displays notifications.
// Props:
// - message: Notification message.
// - type: Type of notification ('error' or 'success').

type ToastProps = {
  message?: string;
  type?: 'error' | 'success';
};

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const { toast } = useToast();

  React.useEffect(() => {
    if (message && type) {
      toast({
        title: type === 'error' ? 'Error' : 'Success',
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [message, type, toast]);

  return null; // The Toaster component will handle rendering
};

export default Toast;
