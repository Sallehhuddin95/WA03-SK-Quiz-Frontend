import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.API_URL || "http://localhost:8000/api/v1";
const BFF_TIMEOUT_MS = 30000;

async function forwardRequest(
  request: NextRequest,
  upstreamPath: string
): Promise<NextResponse> {
  const upstreamUrl = `${BACKEND_BASE_URL}${upstreamPath}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(BFF_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          detail: {
            mesej: "Permintaan mengambil masa terlalu lama. Sila cuba lagi.",
            kod: "MASA_TAMAT",
          },
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        detail: {
          mesej: "Gagal menyambung ke pelayan. Sila periksa sambungan anda.",
          kod: "RALAT_RANGKAIAN",
        },
      },
      { status: 502 }
    );
  }

  const upstreamBody = await upstream.text();

  return new NextResponse(upstreamBody, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}

export { forwardRequest };