/**
 * This route is no longer used — login is handled directly by the
 * real backend via lib/api.ts → authApi.login().
 *
 * Kept as a thin pass-through only if a server-side proxy is needed.
 */
import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.harry-potter.uz/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ detail: "Server xatosi" }, { status: 500 });
  }
}

