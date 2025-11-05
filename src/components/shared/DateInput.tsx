import { Input } from '@/components/ui/input';
import { forwardRef, useState, useEffect } from 'react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value?: string; // formato YYYY-MM-DD
  onChange?: (value: string) => void; // formato YYYY-MM-DD
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const formatToDisplay = (val: string) => {
      if (!val || val === '') return '';
      // Convertir YYYY-MM-DD a DD/MM/YYYY
      if (val.includes('-')) {
        const [year, month, day] = val.split('-');
        if (day && month && year && year.length === 4) {
          return `${day}/${month}/${year}`;
        }
      }
      return '';
    };

    const [displayValue, setDisplayValue] = useState(() => formatToDisplay(value || ''));

    useEffect(() => {
      const formatted = formatToDisplay(value || '');
      setDisplayValue(formatted);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value.replace(/\D/g, ''); // Solo números
      
      // Limitar a 8 dígitos (DDMMYYYY)
      if (input.length > 8) {
        input = input.slice(0, 8);
      }

      // Formatear como DD/MM/YYYY mientras se escribe
      let formatted = '';
      if (input.length > 0) {
        formatted = input.slice(0, 2);
        if (input.length > 2) {
          formatted += '/' + input.slice(2, 4);
        }
        if (input.length > 4) {
          formatted += '/' + input.slice(4, 8);
        }
      }

      setDisplayValue(formatted);

      // Convertir a YYYY-MM-DD si está completo
      if (input.length === 8) {
        const day = input.slice(0, 2);
        const month = input.slice(2, 4);
        const year = input.slice(4, 8);
        
        // Validar día y mes
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
          const dateValue = `${year}-${month}-${day}`;
          onChange?.(dateValue);
        }
      } else if (input.length === 0) {
        onChange?.('');
      }
    };

    const handleBlur = () => {
      // Si no está completo, restaurar el valor anterior
      if (displayValue && displayValue.replace(/\D/g, '').length !== 8) {
        if (value) {
          const [year, month, day] = value.split('-');
          setDisplayValue(`${day}/${month}/${year}`);
        } else {
          setDisplayValue('');
        }
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="DD/MM/YYYY"
        maxLength={10}
      />
    );
  }
);

DateInput.displayName = 'DateInput';

