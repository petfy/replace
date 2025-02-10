
interface Chrome {
  runtime: {
    sendMessage: (
      message: any,
      callback?: (response: any) => void
    ) => void;
  };
}

declare const chrome: Chrome;

interface Window {
  chrome?: Chrome;
}

