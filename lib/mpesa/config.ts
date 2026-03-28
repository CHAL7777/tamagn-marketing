/** Base host only, no trailing slash. */
export function mpesaBaseUrl(): string {
  return (
    process.env.MPESA_BASE_URL?.trim() || "https://sandbox.safaricom.co.ke"
  );
}

/** Kenya default: `/oauth/v1/generate`. Ethiopia sandbox: `/v1/token/generate`. */
export function mpesaOAuthPath(): string {
  return (
    process.env.MPESA_OAUTH_PATH?.trim() || "/oauth/v1/generate"
  );
}

/** Kenya: `/mpesa/stkpush/v1/processrequest`. Ethiopia: `/mpesa/stkpush/v3/processrequest`. */
export function mpesaStkPath(): string {
  return (
    process.env.MPESA_STK_PATH?.trim() || "/mpesa/stkpush/v1/processrequest"
  );
}

/** Kenya sandbox often v1; Ethiopia Postman uses v2. */
export function mpesaB2cPath(): string {
  return (
    process.env.MPESA_B2C_PATH?.trim() || "/mpesa/b2c/v1/paymentrequest"
  );
}

export function mpesaReversalPath(): string {
  const p = process.env.MPESA_REVERSAL_PATH?.trim();
  return p || "/mpesa/reversal/v1/request";
}

export function mpesaTokenUrl(): string {
  const base = mpesaBaseUrl().replace(/\/$/, "");
  const path = mpesaOAuthPath().startsWith("/")
    ? mpesaOAuthPath()
    : `/${mpesaOAuthPath()}`;
  return `${base}${path}?grant_type=client_credentials`;
}

export function mpesaStkUrl(): string {
  const base = mpesaBaseUrl().replace(/\/$/, "");
  const path = mpesaStkPath().startsWith("/")
    ? mpesaStkPath()
    : `/${mpesaStkPath()}`;
  return `${base}${path}`;
}

export function mpesaB2cUrl(): string {
  const base = mpesaBaseUrl().replace(/\/$/, "");
  const path = mpesaB2cPath().startsWith("/")
    ? mpesaB2cPath()
    : `/${mpesaB2cPath()}`;
  return `${base}${path}`;
}

export function mpesaReversalUrl(): string {
  const base = mpesaBaseUrl().replace(/\/$/, "");
  const path = mpesaReversalPath().startsWith("/")
    ? mpesaReversalPath()
    : `/${mpesaReversalPath()}`;
  return `${base}${path}`;
}
