export type PhoneStackParamList = {
  Outbox: undefined;
  Compose: undefined;
};

export type ServerStackParamList = {
  ServerReports: undefined;
  ServerReport: {
    description: string;
    photoCount: number;
    receivedAt: string;
  };
};

export type TabParamList = {
  Phone: undefined;
  Server: undefined;
};
