'use client'

import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
  label?: string
  wrapperClass?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { error, label, wrapperClass, className, id: idProp, required, disabled, ...props },
  ref,
) {
  const [show, setShow] = useState(false)
  const autoId = useId()
  const inputId = idProp ?? autoId
  const errorId = `${inputId}-error`

  return (
    <div className={cn('w-full', wrapperClass)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={show ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : props['aria-describedby']}
          className={cn(
            'w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 pr-12 text-sm text-gray-900 transition-colors',
            'dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            error ? 'border-red-400 dark:border-red-500' : 'border-gray-300',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-controls={inputId}
          className={cn(
            'absolute right-0 top-0 flex h-full w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-r-xl',
            'text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
          )}
        >
          {show ? <Eye size={16} aria-hidden="true" strokeWidth={2} /> : <EyeOff size={16} aria-hidden="true" strokeWidth={2} />}
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
