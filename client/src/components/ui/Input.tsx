import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; leftIcon?: ReactNode; rightIcon?: ReactNode; helperText?: string;
}
export default function Input({ label, error, leftIcon, rightIcon, helperText, className = '', id, ...props }: InputProps) {
  const generated = useId(), inputId = id || generated, descriptionId = inputId + '-description';
  const description = error || helperText;
  return <div className="w-full">
    {label && <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
    <div className="relative">
      {leftIcon && <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{leftIcon}</span>}
      <input {...props} id={inputId} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={[props['aria-describedby'], description ? descriptionId : null].filter(Boolean).join(' ') || undefined}
        className={['input', error ? 'input-error' : '', leftIcon ? 'pl-10' : '', rightIcon ? 'pr-10' : '', className].join(' ')} />
      {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
    </div>
    {description && <p id={descriptionId} className={'mt-2 text-sm ' + (error ? 'text-red-700' : 'text-gray-600')}>{description}</p>}
  </div>;
}
