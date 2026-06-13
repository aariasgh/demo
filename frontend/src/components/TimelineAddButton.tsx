// frontend/src/components/TimelineAddButton.tsx

import { PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import TimelineAddNoteModal from './modals/TimelineAddNoteModal';
import TimelineAddCallModal from './modals/TimelineAddCallModal';
import TimelineAddEmailModal from './modals/TimelineAddEmailModal';

interface TimelineAddButtonProps {
  leadId: number;
  onEventAdded: () => void;
}

export default function TimelineAddButton({ leadId, onEventAdded }: TimelineAddButtonProps) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <div data-testid="timeline-add-toolbar" className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          data-testid="timeline-add-note-button"
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nota</span>
        </button>

        <button
          data-testid="timeline-add-call-button"
          onClick={() => setShowCallModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Llamada</span>
        </button>

        <button
          data-testid="timeline-add-email-button"
          onClick={() => setShowEmailModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Email</span>
        </button>
      </div>

      {showNoteModal && (
        <TimelineAddNoteModal
          leadId={leadId}
          onClose={() => setShowNoteModal(false)}
          onSuccess={() => {
            setShowNoteModal(false);
            onEventAdded();
          }}
        />
      )}

      {showCallModal && (
        <TimelineAddCallModal
          leadId={leadId}
          onClose={() => setShowCallModal(false)}
          onSuccess={() => {
            setShowCallModal(false);
            onEventAdded();
          }}
        />
      )}

      {showEmailModal && (
        <TimelineAddEmailModal
          leadId={leadId}
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            setShowEmailModal(false);
            onEventAdded();
          }}
        />
      )}
    </>
  );
}
