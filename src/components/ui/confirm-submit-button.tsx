"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";

type ConfirmSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
};

export function ConfirmSubmitButton({
  confirmMessage,
  onClick,
  type = "submit",
  ...props
}: ConfirmSubmitButtonProps) {
  const confirm = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  };

  return <button {...props} type={type} onClick={confirm} />;
}
