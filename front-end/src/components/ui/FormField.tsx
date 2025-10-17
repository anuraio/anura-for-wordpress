interface FormFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, helpText, error, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block mb-2">
        <span className="font-medium text-gray-900">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </span>
      </label>
      
      {children}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {!error && helpText && (
        <p className="mt-1 text-sm text-gray-600">{helpText}</p>
      )}
    </div>
  );
}