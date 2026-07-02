import { InputHTMLAttributes, useState } from 'react';
import { Icon } from '../../../shared/ui';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordInput({ disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="input-wrap input-wrap-password">
      <Icon name="lock" size={16} />
      <input {...props} type={visible ? 'text' : 'password'} disabled={disabled} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={16} />
      </button>
    </span>
  );
}
