import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { Fragment } from 'react';
import { HiEmojiSad, HiHome, HiPlus } from 'react-icons/hi';
import Button from '../../components/button/button';
import Select from '../../components/select/select';

export interface WorkDialogProps {
  date: Date;
  open: boolean;
  onClose: () => void;
}

export function WorkDialog({ date, open, onClose }: WorkDialogProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 font-bold mb-2"
                >
                  <span>{format(date, 'dd.MM.yyyy')} - 8h / 1h</span>
                </Dialog.Title>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div>08:00 - 17:00 / 12:00 - 13:00</div>
                    <Select
                      className="flex-grow"
                      selected={1}
                      options={[
                        { value: 1, label: 'UCS' },
                        { value: 2, label: 'ÖBB' },
                      ]}
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="flex-grow rounded-md outline-0 ring-outset ring-1 ring-slate-200 hover:ring-slate-400 bg-white p-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      placeholder="Example: 8-17/12-13"
                    />
                    <Button>
                      <HiPlus />
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button title="homeoffice" pressed={true}>
                        <HiHome />
                      </Button>
                      <Button title="sick leave" pressed={false}>
                        <HiEmojiSad />
                      </Button>
                    </div>
                    <Button>Save</Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default WorkDialog;
