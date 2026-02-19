import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.harry-potter.uz/api/v1";

const IS_PROD = process.env.NODE_ENV === "production";

/** Cookie names – keep in sync with middleware.ts and lib/cookies.ts */
export const COOKIE_ACCESS = "hp_access";
export const COOKIE_REFRESH = "hp_refresh";
export const COOKIE_USER = "hp_user";

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

    const { tokens, user } = data as {
      tokens: { access: string; refresh: string };
      user: { id: number; username: string; role: string; full_name: string };
    };

    const response = NextResponse.json({ user }, { status: 200 });

    // Access token – JS-readable (needed for Authorization header in client-side API calls)
    response.cookies.set(COOKIE_ACCESS, tokens.access, {
      httpOnly: false,
      secure: IS_PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Refresh token – httpOnly, never accessible from JS
    response.cookies.set(COOKIE_REFRESH, tokens.refresh, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 3, // 3 days
    });

    // User info – JS-readable (for client AuthContext)
    response.cookies.set(COOKIE_USER, JSON.stringify(user), {
      httpOnly: false,
      secure: IS_PROD,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
    });

    return response;
  } catch {
    return NextResponse.json({ detail: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  for (const name of [COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_USER]) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
  return response;
}

