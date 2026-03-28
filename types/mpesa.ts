/** Daraja STK Push — request payload (server-side). */
export type StkPushInput = {
  amount: number;
  /** Local or international MSISDN (normalized with `MPESA_MSISDN_COUNTRY_CODE`). */
  phone: string;
  accountReference: string;
  transactionDesc: string;
  /** Some APIs (e.g. ET stkpush v3) expect a partner-supplied id. */
  merchantRequestId?: string;
  referenceData?: { Key: string; Value: string }[];
};

export type StkPushApiBody = {
  MerchantRequestID?: string;
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
  ReferenceData?: { Key: string; Value: string }[];
};

/** Minimal success shape from `processrequest` response. */
export type StkPushProcessResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
};

/** Lipa na M-Pesa Online callback (stkCallback) — subset used for escrow. */
export type MpesaStkCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: { Name?: string; Value?: string | number }[];
      };
    };
  };
};

export type B2CPaymentInput = {
  /** Customer MSISDN (international). */
  partyB: string;
  amount: number;
  remarks?: string;
  /** API field spelling `Occassion` in some docs. */
  occasion?: string;
  originatorConversationId?: string;
  commandId?: string;
};

export type B2CPaymentApiBody = {
  OriginatorConversationID: string;
  InitiatorName: string;
  SecurityCredential: string;
  CommandID: string;
  PartyA: string;
  PartyB: string;
  Amount: number;
  Remarks: string;
  Occassion: string;
  QueueTimeOutURL: string;
  ResultURL: string;
};

export type ReversalInput = {
  transactionId: string;
  amount: number;
  receiverParty: string;
  /** Original STK / C2B conversation id when applicable. */
  originalConversationId?: string;
  remarks?: string;
  occasion?: string;
  originatorConversationId?: string;
};

export type ReversalApiBody = {
  OriginatorConversationID: string;
  Initiator: string;
  SecurityCredential: string;
  CommandID: string;
  TransactionID: string;
  Amount: number;
  OriginalConversationID?: string;
  PartyA: string;
  RecieverIdentifierType: string;
  ReceiverParty: string;
  ResultURL: string;
  QueueTimeOutURL: string;
  Remarks: string;
  Occasion: string;
};
