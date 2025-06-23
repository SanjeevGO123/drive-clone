import React from 'react';

type ToastProps = {
  message?: string;
  type?: 'error' | 'success';
};

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  if (!message || !type) return null;
  
  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-all ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {message}
    </div>
  );
};

export default Toast;
