import { WorkDay } from '@myin/models';
import { getWorkHoursInDay } from '@myin/work-time-parser';
import { format, isToday, isWeekend } from 'date-fns';
import { FaUmbrellaBeach } from 'react-icons/fa';
import { HiEmojiSad, HiLockClosed } from 'react-icons/hi';

interface WorkCellProps {
  date: Date;
  isSelected?: boolean;
  isOpen?: boolean;
  day?: WorkDay;
}

export function WorkCell({ day, date, isSelected, isOpen }: WorkCellProps) {
  const bgColor = () => {
    if (isSelected) {
      return 'bg-blue-200';
    }

    if (isWeekend(date)) {
      return 'bg-red-50';
    }

    return '';
  };

  const dateStyle = () => {
    let cls = '';

    if (isToday(date)) {
      cls += ' text-white bg-blue-700';
    }

    if (isOpen) {
      cls += ' underline font-bold';
    }

    return cls;
  };

  return (
    <div
      className={`flex flex-col items-start font-light grow p-2 gap-1 ${bgColor()}`}
    >
      <div className="flex flex-row gap-2 items-center">
        <span
          className={`rounded-full w-6 h-6 flex justify-center items-center ${dateStyle()}`}
        >
          <span>{format(date, 'dd')}</span>
        </span>
        <span>{day?.locked && <HiLockClosed />}</span>
      </div>
      {day && (
        <div className="flex flex-row gap-2 items-center h-8">
          {day.vacation && <FaUmbrellaBeach />}
          {day.sickLeave && <HiEmojiSad />}
          {getWorkHoursInDay(day)}
        </div>
      )}
    </div>
  );
}
