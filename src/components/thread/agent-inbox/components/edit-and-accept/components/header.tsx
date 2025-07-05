import { ResetButton } from "../../shared/reset-button";
import { HeaderProps } from "../types";

export function Header({ title, onReset }: HeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-base font-semibold text-black">{title}</p>
      <ResetButton handleReset={onReset} />
    </div>
  );
}