interface StatusIndicatorProps {
  streaming: boolean;
  streamFinished: boolean;
}

export function StatusIndicator({
  streaming,
  streamFinished,
}: StatusIndicatorProps) {
  if (streaming) {
    return <p className="text-sm text-gray-600">Running...</p>;
  }

  if (streamFinished) {
    return (
      <p className="text-base font-medium text-green-600">
        Successfully finished Graph invocation.
      </p>
    );
  }

  return null;
}
