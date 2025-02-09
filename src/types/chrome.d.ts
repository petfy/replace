
interface Chrome {
  runtime: {
    id?: string;
    sendMessage: (
      message: any,
      callback?: (response: any) => void
    ) => void;
  };
}

interface Window {
  chrome?: Chrome;
}
