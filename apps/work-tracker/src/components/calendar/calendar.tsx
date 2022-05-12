import {
  eachWeekOfInterval,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  format,
  formatISO,
  isSameMonth,
} from 'date-fns';
import { useState } from 'react';

/* eslint-disable-next-line */
export interface CalendarProps {
  onDateClicked: (d: Date) => void;
}

export function Calendar({ onDateClicked }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateClicked = (date: Date) => {
    setSelectedDate(date);
    onDateClicked(date);
  };

  const date = new Date();
  const weeks = eachWeekOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  }).map((day) => {
    const weekDays = [day];
    for (let i = 1; i <= 6; i++) {
      weekDays.push(addDays(day, i));
    }

    return (
      <div
        className="inline-flex items-center justify-start h-full w-full"
        key={day.toISOString()}
      >
        {weekDays.map((d) => {
          const isSelected = isSameDay(selectedDate, d);

          return (
            <div
              className={`flex items-start justify-start w-40 h-full pl-2 pr-32 pt-2.5 pb-24 border border-gray-200 ${
                !isSameMonth(selectedDate, d) ? 'opacity-50' : ''
              }`}
              key={d.toISOString()}
              title={formatISO(d, { representation: 'date' })}
              onClick={() => dateClicked(d)}
            >
              <p className="text-sm font-medium text-gray-800">
                {format(d, 'dd')}
              </p>
            </div>
          );
        })}
      </div>
    );
  });

  const title = format(selectedDate, 'MMMM yyyy');
  const weekDayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white md:py-8 px-4 lg:max-w-7xl lg:mx-auto lg:px-8">
      <p className="text-4xl font-bold text-gray-800 mb-8">{title}</p>
      <div className="inline-flex flex-col space-y-1 items-start justify-start h-full w-full">
        <div className="inline-flex space-x-28 items-start justify-start pr-24 h-full w-full">
          {weekDayLetters.map((l) => (
            <p className="w-12 h-full text-sm font-medium text-gray-800 uppercase">
              {l}
            </p>
          ))}
        </div>
        <div className="flex flex-col items-start justify-start">{weeks}</div>
      </div>
    </div>
  );
}

export default Calendar;
