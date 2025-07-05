export function createActionHandler(stream: any) {
  return (prompt: string) => {
    stream.submit({ messages: prompt });
  };
}
