
interface Chrome {
  runtime: {
    sendMessage: (
      message: any,
      callback?: (response: any) => void
    ) => void;
    id?: string;  // Adding the id property as optional
  };
}

declare const chrome: Chrome;

interface Window {
  chrome?: Chrome;
}

