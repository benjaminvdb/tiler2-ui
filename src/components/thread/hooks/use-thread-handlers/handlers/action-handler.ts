export const createActionHandler = (stream: any) => {
  return (prompt: string) => {
    stream.submit({ messages: prompt });
  };
};
