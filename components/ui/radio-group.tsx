'use client';

import React from 'react';

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
    <fieldset disabled={disabled} className={disabled ? 'opacity-50' : ''}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: value === (child.props as any).value,
            onChange: () => onValueChange?.((child.props as any).value),
          } as any);
        }
        return child;
      })}
    </fieldset>
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
  checked,
  onChange,
  disabled,
}: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-4 h-4 cursor-pointer"
    />
  );
}
