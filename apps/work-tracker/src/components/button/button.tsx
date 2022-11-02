export interface ButtonProps {
  onClick?: () => void;
  title?: string;
  pressed?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  title,
  pressed,
  className,
  disabled,
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      type="button"
      className={`${className} rounded-md border border-transparent px-4 py-2 text-sm
      font-medium focus:outline-none focus-visible:ring-2
      disabled:opacity-50
      focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        pressed
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
      }`}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
