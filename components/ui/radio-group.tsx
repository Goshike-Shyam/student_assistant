'use client';

import React, { createContext, useContext } from 'react';

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({});

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function RadioGroup({
  value,
  onValueChange,
  disabled,
  children,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <fieldset disabled={disabled} className={disabled ? 'opacity-50' : ''}>
        {children}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
}

export function RadioGroupItem({
  value,
  id,
  disabled,
}: RadioGroupItemProps) {
  const ctx = useContext(RadioGroupContext);
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={ctx.value === value}
      onChange={() => ctx.onValueChange?.(value)}
      disabled={disabled ?? ctx.disabled}
      className="w-4 h-4 cursor-pointer"
    />
  );
}
