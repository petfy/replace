interface Chrome {
  runtime: {
    sendMessage: (
      message: any,
      callback?: (response: any) => void
    ) => void;
  };
}

interface Window {
  chrome?: Chrome;
}