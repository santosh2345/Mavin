import { forwardRef } from 'react';
import cn from 'classnames';

interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | any;
  className?: string;
}

const RadioButton = forwardRef<HTMLInputElement, CheckBoxProps>(
  ({ label, className, ...rest }, ref) => {
    return (
      <label
        className={cn(
          'group flex cursor-pointer items-center justify-between text-13px transition-all',
          className
        )}
      >
        <input
          type="radio"
          className="radio-component invisible absolute -z-[1] opacity-0"
          ref={ref}
          {...rest}
        />
        <span />
        <span className="ml-2.5 text-dark/70 dark:text-light/70">{label}</span>
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';
export default RadioButton;
