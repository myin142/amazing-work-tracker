// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import Button from '../components/button/button';
import WorkDialog from './work-dialog/work-dialog';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center">
        <Button onClick={() => setWorkDialogOpen(true)}>Open Dialog</Button>
      </div>

      <WorkDialog
        open={workDialogOpen}
        onClose={() => setWorkDialogOpen(false)}
      />
    </div>
  );
}

export default App;
