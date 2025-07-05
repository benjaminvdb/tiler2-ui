import { Separator } from "@/components/ui/separator";

interface MethodSeparatorProps {
  supportsMultipleMethods: boolean;
}

export function MethodSeparator({
  supportsMultipleMethods,
}: MethodSeparatorProps) {
  if (!supportsMultipleMethods) {
    return null;
  }

  return (
    <div className="mx-auto mt-3 flex items-center gap-3">
      <Separator className="w-[full]" />
      <p className="text-sm text-gray-500">Or</p>
      <Separator className="w-full" />
    </div>
  );
}
