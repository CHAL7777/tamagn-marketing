import { NextResponse } from "next/server";

export function ensureMpesaCallbackAuthorized(request: Request) {
  const secret = process.env.MPESA_CALLBACK_SECRET?.trim();
  if (!secret) return null;

  const sent = request.headers.get("x-mpesa-callback-secret");
  if (sent === secret) return null;

  return NextResponse.json(
    { ResultCode: 1, ResultDesc: "Unauthorized" },
    { status: 401 }
  );
}

export async function readMpesaCallbackJson(request: Request) {
  try {
    return {
      ok: true as const,
      raw: (await request.json()) as unknown,
    };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({
        ResultCode: 1,
        ResultDesc: "Bad JSON",
      }),
    };
  }
}

export function acknowledgeMpesaCallback(resultDesc = "Success") {
  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: resultDesc,
  });
}
