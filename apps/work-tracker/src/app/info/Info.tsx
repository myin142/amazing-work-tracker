import { UserInfo } from '@myin/client';
import { useState } from 'react';
import { AiFillSetting } from 'react-icons/ai';
import Button from '../../components/button/button';

interface InfoProps {
  info?: UserInfo | null;
  onLogout: () => void;
}

export function Info({ info, onLogout }: InfoProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <div className="p-2 cursor-pointer" onClick={() => setVisible(!visible)}>
        <AiFillSetting />
      </div>
      {visible && (
        <div className="absolute bg-blue-100 p-2 rounded flex flex-col gap-2 text-sm w-80">
          <div>{info?.email || '<EMPTY>'}</div>
          <Button onClick={() => onLogout()}>Logout</Button>
        </div>
      )}
    </div>
  );
}
