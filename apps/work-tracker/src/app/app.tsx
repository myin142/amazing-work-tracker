// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';
import Button from '../components/button/button';
import { WorkDay } from '@myin/models';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWorkDay, setCurrentWorkDay] = useState(null as WorkDay | null);

  const onDateClicked = (d: Date) => {
    setCurrentWorkDay({} as WorkDay);
    setSelectedDate(d);
    setWorkDialogOpen(true);
  };

  const closeDialog = () => setWorkDialogOpen(false);

  const saveDay = (workDay: WorkDay) => {
    console.log(workDay);
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-4 items-center p-4">
      <Calendar
        onDateClicked={onDateClicked}
        cell={(d: Date) => <div>8h / 1h</div>}
      />

      <div className="flex gap-2">
        <Button>Vacation</Button>
        <Button>Off-Duty</Button>
        <Button>Sick</Button>
      </div>

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
