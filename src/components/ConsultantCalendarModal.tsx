import React from 'react';
import { Modal } from './Modal';
import { ConsultantCalendar } from './ConsultantCalendar';
import { Calendar } from 'lucide-react';

interface ConsultantCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultantCalendarModal({ isOpen, onClose }: ConsultantCalendarModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#00a19a]" />
          <span>Planning des Candidats</span>
        </div>
      }
    >
      <ConsultantCalendar />
    </Modal>
  );
}