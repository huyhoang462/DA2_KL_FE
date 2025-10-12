import { X } from 'lucide-react';

const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background-secondary relative w-full max-w-sm rounded-lg p-6 shadow-xl">
        <button
          className="hover:text-primary text-text-primary absolute top-3 right-3 cursor-pointer"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-text-primary mb-4 text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
