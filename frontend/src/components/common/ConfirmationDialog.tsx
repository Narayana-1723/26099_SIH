import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gov-navy flex-shrink-0" />;
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <button onClick={onClose} disabled={isLoading} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={getConfirmButtonClasses()}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {getIcon()}
        <div className="text-sm text-slate-700 leading-relaxed">{message}</div>
      </div>
    </Modal>
  );
};
