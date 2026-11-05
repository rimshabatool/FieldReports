export type PhoneStackParamList = {
  Outbox: undefined;
  Compose: undefined;
};

export type ServerStackParamList = {
  ServerReports: undefined;
  ServerReport: {
    clientId: string;
    description: string;
    photoCount: number;
    receivedAt: string;
    photos: {filename: string; url: string}[];
  };
};

export type TabParamList = {
  Phone: undefined;
  Server: undefined;
};
