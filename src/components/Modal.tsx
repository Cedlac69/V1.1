import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block w-full align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-4 sm:align-middle sm:w-full sm:max-w-[100vw] border-2 border-[#e5e5e5] max-h-[95vh] overflow-y-auto">
          <div className="bg-white px-6 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-[#3c3c3c]">{title}</h3>
              <button
                onClick={onClose}
                className="text-[#afafaf] hover:text-[#3c3c3c] transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="max-h-[calc(95vh-120px)] overflow-y-auto pr-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}