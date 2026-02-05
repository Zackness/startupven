interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </div>
  );
};
