import {
  eachWeekOfInterval,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  format,
  isSameMonth,
  isSunday,
  isSaturday,
  sub,
  add,
  isToday,
} from 'date-fns';
import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/* eslint-disable-next-line */
export interface CalendarProps {
  onDateClicked: (d: Date) => void;
  cell?: (d: Date) => JSX.Element;
}

export function Calendar({ onDateClicked, cell }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const date = new Date();

  const dateClicked = (date: Date) => {
    setSelectedDate(date);
    onDateClicked(date);
  };

  let start = startOfMonth(date);
  if (isSunday(start)) {
    start = sub(start, { days: 1 });
  }

  let end = endOfMonth(date);
  if (isSaturday(end)) {
    end = add(end, { days: 1 });
  }

  const weeks = eachWeekOfInterval({ start, end }).map((day) => {
    const weekDays = [day];
    for (let i = 1; i <= 6; i++) {
      weekDays.push(addDays(day, i));
    }

    return (
      <tr key={day.toISOString()}>
        {weekDays.map((d) => {
          const isSelected = isSameDay(selectedDate, d);

          return (
            <td
              className={`rounded-lg ring-1 border-separate space-4 gap-4 p-4 text-sm cursor-pointer ${
                !isSameMonth(date, d) ? 'opacity-50' : ''
              }`}
              key={d.toISOString()}
              onClick={() => dateClicked(d)}
            >
              <div className="flex flex-col">
                <span className="font-bold">{format(d, 'dd')}</span>
                {cell && cell(d)}
              </div>
            </td>
          );
        })}
      </tr>
    );
  });

  const title = format(date, 'MMMM yyyy');
  const weekDayLetters = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white text-gray-800">
      <div className="text-4xl font-bold flex items-center">
        <button>
          <HiChevronLeft />
        </button>
        <span>{title}</span>
        <button>
          <HiChevronRight />
        </button>
      </div>
      <table className="border-collapse mt-4">
        <tr>
          {weekDayLetters.map((l) => (
            <th className="text-sm text800 uppercase">{l}</th>
          ))}
        </tr>
        {weeks}
      </table>
    </div>
  );
}

export default Calendar;
