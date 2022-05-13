import { Dialog, Transition } from '@headlessui/react';
import { WorkDay, WorkTime } from '@myin/models';
import {
  add,
  format,
  intervalToDuration,
  isToday,
  startOfToday,
  sub,
} from 'date-fns';
import { Fragment, useEffect, useState } from 'react';
import { HiEmojiSad, HiHome, HiMinus, HiPlus } from 'react-icons/hi';
import Button from '../../components/button/button';
import Select from '../../components/select/select';
import { parseWorkTime } from './work-time-parser';

export interface WorkDialogProps {
  date: Date;
  workDay?: WorkDay | null;
  open: boolean;
  onClose: () => void;
  onSave: (workDay: WorkDay) => void;
}

const formatTime = (date: Date) => {
  return format(date, 'HH:mm');
};

const formatDuration = (date: Date): string =>
  isToday(date) ? `${format(date, 'H')} h` : `> 24 h`;

const intervalTotalTime = (intervals: Interval[]): Date =>
  intervals
    .map((i) => intervalToDuration(i))
    .reduce((date, dur) => add(date, dur), startOfToday());

export function WorkDialog({
  date,
  workDay,
  open,
  onClose,
  onSave,
}: WorkDialogProps) {
  const [workTimeInput, setWorkTimeInput] = useState('');
  const [workTimes, setWorkTimes] = useState([] as WorkTime[]);
  const [sickLeave, setSickLeave] = useState(false);
  const [homeoffice, setHomeOffice] = useState(false);

  useEffect(() => {
    setWorkTimes(workDay?.workTimes || []);
    setSickLeave(workDay?.sickLeave || false);
    setHomeOffice(workDay?.homeoffice || false);
  }, [workDay]);

  const save = () => {
    onSave({
      workTimes,
      sickLeave,
      homeoffice,
    });
  };

  const addWorkTime = () => {
    const workTime = parseWorkTime(workTimeInput);
    if (workTime) {
      setWorkTimes([...workTimes, workTime]);
      setWorkTimeInput('');
    }
  };

  const updateWorkTime = (index: number, value: Partial<WorkTime>) => {
    workTimes[index] = { ...workTimes[index], ...value };
    setWorkTimes([...workTimes]);
  };

  const removeWorkTime = (i: number) => {
    setWorkTimes(filterRemovedWorkTime(i));
  };

  const filterRemovedWorkTime = (idx: number) =>
    workTimes.filter((_, i) => i !== idx);

  const workTimeInputKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addWorkTime();
    }
  };

  const workTimeIntervals = (): Interval[] =>
    workTimes.map((w) => ({ start: w.timeFrom, end: w.timeTo }));

  const breakIntervals = (): Interval[] =>
    workTimes
      .filter((w) => w.breakFrom && w.breakTo)
      .map((w) => ({ start: w.breakFrom as Date, end: w.breakTo as Date }));

  const totalTimes = (): string => {
    const time = intervalTotalTime(workTimeIntervals());
    const breakTime = intervalTotalTime(breakIntervals());
    const subtracted = sub(
      time,
      intervalToDuration({ start: startOfToday(), end: breakTime })
    );

    return `${formatDuration(subtracted)} / ${formatDuration(breakTime)}`;
  };

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
                  className="text-lg leading-6 text-gray-900 font-bold mb-2 flex justify-between"
                >
                  <span>{format(date, 'dd.MM.yyyy')}</span>
                  <span>{totalTimes()}</span>
                </Dialog.Title>

                <div className="flex flex-col gap-4">
                  {workTimes.map((work, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div>
                        {formatTime(work.timeFrom)} - {formatTime(work.timeTo)}
                        {work.breakFrom &&
                          work.breakTo &&
                          ` / ${formatTime(work.breakFrom)} - ${formatTime(
                            work.breakTo
                          )}`}
                      </div>
                      <Select
                        className="flex-grow"
                        selected={work.projectId}
                        onSelected={(id) =>
                          updateWorkTime(i, { projectId: id })
                        }
                        options={[
                          { value: 1, label: 'UCS' },
                          { value: 2, label: 'ÖBB' },
                        ]}
                      />
                      <Button onClick={() => removeWorkTime(i)}>
                        <HiMinus />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      className="flex-grow rounded-md outline-none ring-outset ring-1 ring-slate-200 hover:ring-slate-400 bg-white p-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      placeholder="Example: 8-17/12-13"
                      value={workTimeInput}
                      onChange={(e) => setWorkTimeInput(e.target.value)}
                      onKeyUp={workTimeInputKeyUp}
                    />
                    <Button onClick={addWorkTime}>
                      <HiPlus />
                    </Button>
                  </div>
                  <div className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button
                        title="homeoffice"
                        pressed={homeoffice}
                        onClick={() => setHomeOffice(!homeoffice)}
                      >
                        <HiHome />
                      </Button>
                      <Button
                        title="sick leave"
                        pressed={sickLeave}
                        onClick={() => setSickLeave(!sickLeave)}
                      >
                        <HiEmojiSad />
                      </Button>
                    </div>
                    <Button onClick={() => save()}>Save</Button>
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
