import { Dialog } from '@headlessui/react';

export interface WorkDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WorkDialog({ open, onClose }: WorkDialogProps) {
  return (
    <Dialog open={open} onClose={() => onClose()}>
      <Dialog.Panel>
        <Dialog.Title>Deactivate account</Dialog.Title>
        <Dialog.Description>
          This will permanently deactivate your account
        </Dialog.Description>

        <p>
          Are you sure you want to deactivate your account? All of your data
          will be permanently removed. This action cannot be undone.
        </p>
      </Dialog.Panel>
    </Dialog>
  );
}

export default WorkDialog;
