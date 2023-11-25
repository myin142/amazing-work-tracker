import { useState } from 'react';
import { differenceInMilliseconds } from 'date-fns';

export interface ButtonProps {
  onClick?: () => void;
  onHold?: () => void;
  title?: string;
  pressed?: boolean;
  className?: string;
  disabled?: boolean;
}

const HOLD_THRESHOLD = 500;

export function Button({
  children,
  onClick,
  onHold,
  title,
  pressed,
  className,
  disabled,
}: React.PropsWithChildren<ButtonProps>) {
  const [holdTime, setHoldTime] = useState(undefined as Date | undefined);
  const [ignoreNextClick, setIgnoreNextClick] = useState(false);

  const onMouseDown = () => {
    setHoldTime(new Date());
  };

  const onMouseUp = () => {
    if (holdTime && onHold) {
      const diff = differenceInMilliseconds(new Date(), holdTime);
      if (diff >= HOLD_THRESHOLD) {
        onHold();
        setIgnoreNextClick(true);
      }
    }

    setHoldTime(undefined);
  };

  const mightOnClick = () => {
    if (ignoreNextClick) {
      setIgnoreNextClick(false);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`${className} rounded-md border border-transparent px-4 py-2 text-sm
      font-medium focus:outline-none focus-visible:ring-2
      disabled:opacity-50
      focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        pressed
          ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-200/75 dark:text-slate-700 dark:hover:bg-blue-100'
          : 'bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-white/75 dark:hover:bg-blue-800'
      }`}
      onClick={mightOnClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
