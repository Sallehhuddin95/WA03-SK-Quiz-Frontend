import { NextRequest, NextResponse } from "next/server";

export const BACKEND_BASE_URL =
  process.env.API_URL || "http://localhost:8000/api/v1";
const BFF_TIMEOUT_MS = 30000;

const SESSION_COOKIE_NAME = "sk_quiz_sesi";

function getUpstreamSetCookies(upstream: Response): string[] {
  if (typeof upstream.headers.getSetCookie === "function") {
    return upstream.headers.getSetCookie();
  }

  const value = upstream.headers.get("set-cookie");
  return value ? [value] : [];
}

function relaySetCookieHeaders(response: NextResponse, upstream: Response): void {
  const setCookies = getUpstreamSetCookies(upstream);
  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }
}

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

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (sessionCookie) {
    headers.set("cookie", `${SESSION_COOKIE_NAME}=${sessionCookie.value}`);
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

  const response = new NextResponse(upstreamBody, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });

  relaySetCookieHeaders(response, upstream);

  return response;
}

export { forwardRequest };
