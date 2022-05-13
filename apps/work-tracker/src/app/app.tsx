// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';
import Button from '../components/button/button';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onDateClicked = (d: Date) => {
    setSelectedDate(d);
    setWorkDialogOpen(true);
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
        open={workDialogOpen}
        onClose={() => setWorkDialogOpen(false)}
      />
    </div>
  );
}

export default App;
