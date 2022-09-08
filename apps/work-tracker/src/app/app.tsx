// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';
import Button from '../components/button/button';
import { WorkDay, FullDayType } from '@myin/models';
import { isWeekend } from 'date-fns';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWorkDay, setCurrentWorkDay] = useState(null as WorkDay | null);
  const [fullDayType, setFullDayType] = useState(null as FullDayType | null);

  const onDateClicked = (d: Date) => {
    setCurrentWorkDay({} as WorkDay);
    setSelectedDate(d);
    setWorkDialogOpen(true);
  };

  const onRangeSelected = (i: Interval) => {
    console.log(i); // TODO set full days
    setFullDayType(null);
  };

  const closeDialog = () => setWorkDialogOpen(false);

  const saveDay = (workDay: WorkDay) => {
    console.log(workDay); // TODO save day
    closeDialog();
  };

  const toggleFullDayType = (type: FullDayType) => {
    if (fullDayType === type) {
      setFullDayType(null);
    } else {
      setFullDayType(type);
    }
  };

  const fullDayTypeButtons = Object.values(FullDayType).map((type) => (
    <Button
      onClick={() => toggleFullDayType(type)}
      pressed={fullDayType === type}
    >
      {type}
    </Button>
  ));

  return (
    <div className="flex flex-col gap-4 items-center p-4 h-full">
      <Calendar
        rangeSelect={!!fullDayType}
        onRangeSelected={onRangeSelected}
        onDateClicked={onDateClicked}
        cell={(d: Date) => <div>{!isWeekend(d) ? '8h / 1h' : ''}</div>}
      />

      <div className="flex gap-2">{fullDayTypeButtons}</div>

      <WorkDialog
        date={selectedDate}
        workDay={currentWorkDay}
        open={workDialogOpen}
        onClose={closeDialog}
        onSave={saveDay}
      />
    </div>
  );
}

export default App;
