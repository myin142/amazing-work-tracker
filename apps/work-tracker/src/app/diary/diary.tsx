import { useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { HiEye, HiEyeOff } from 'react-icons/hi';

interface DiaryProps {
  text: string;
  onChange: (s: string) => void;
}

export function Diary({ text, onChange }: DiaryProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        {showPreview ? (
          <HiEyeOff
            className="cursor-pointer"
            onClick={() => setShowPreview(false)}
          />
        ) : (
          <HiEye
            className="cursor-pointer"
            onClick={() => setShowPreview(true)}
          />
        )}
      </div>
      {showPreview ? (
        <MarkdownPreview source={text} />
      ) : (
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dear Diary..."
          className="border rounded p-2"
          rows={15}
        />
      )}
    </div>
  );
}
