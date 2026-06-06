import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "w-full rounded-2xl py-3 font-semibold transition active:scale-95",

        {
          "bg-purple-600 text-white":
            variant === "primary",

          "bg-gray-100 text-black":
            variant === "secondary",

          "bg-red-500 text-white":
            variant === "danger",
        },

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}