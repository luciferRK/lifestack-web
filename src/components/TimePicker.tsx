import React from 'react';
import { Clock } from 'lucide-react';

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  testId?: string;
  placeholder?: string;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  testId,
  placeholder = 'Select time',
}) => (
  <label className="relative block">
    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      data-testid={testId}
      type="time"
      value={value}
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900/70 pl-10 pr-3 text-sm text-white [color-scheme:dark] focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </label>
);
