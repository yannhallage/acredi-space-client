import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { SyncLoader } from 'react-spinners';

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function AuthSubmitButton({
  loading = false,
  children,
  className = '',
  disabled,
  type = 'submit',
  ...props
}: AuthSubmitButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`button primary button-wide auth-submit-btn ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <span className="auth-submit-loader" aria-hidden="true">
          <SyncLoader color="#ffffff" size={7} margin={3} speedMultiplier={0.85} />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
