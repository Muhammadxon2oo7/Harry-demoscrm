import { NextRequest, NextResponse } from "next/server";

/** Map each role to its protected path prefix */
const ROLE_PATHS: Record<string, string> = {
  owner: "/admin",
  employee: "/staff",
  student: "/student",
};

/** Paths that must be protected and which role is allowed */
const PROTECTED: Array<{ prefix: string; role: string }> = [
  { prefix: "/admin", role: "owner" },
  { prefix: "/staff", role: "employee" },
  { prefix: "/student", role: "student" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Determine if the request is for a protected route ──────────────────────
  const guard = PROTECTED.find((p) => pathname.startsWith(p.prefix));

  const userCookie = request.cookies.get("hp_user")?.value;
  const accessCookie = request.cookies.get("hp_access")?.value;

  // ── Not a protected route → allow through ──────────────────────────────────
  if (!guard) {
    // If already logged in and visiting /login, redirect to own dashboard
    if (pathname === "/login" && userCookie && accessCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie)) as {
          role: string;
        };
        const dest = ROLE_PATHS[user.role];
        if (dest) {
          return NextResponse.redirect(new URL(dest, request.url));
        }
      } catch {
        // corrupted cookie — clear and stay on /login
        const res = NextResponse.next();
        res.cookies.set("hp_user", "", { maxAge: 0, path: "/" });
        res.cookies.set("hp_access", "", { maxAge: 0, path: "/" });
        return res;
      }
    }
    return NextResponse.next();
  }

  // ── Protected route: require a valid session cookie ────────────────────────
  if (!userCookie || !accessCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Parse role from cookie ─────────────────────────────────────────────────
  let role: string;
  try {
    const user = JSON.parse(decodeURIComponent(userCookie)) as {
      role: string;
    };
    role = user.role;
  } catch {
    // Corrupted cookie — send to login
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("hp_user", "", { maxAge: 0, path: "/" });
    res.cookies.set("hp_access", "", { maxAge: 0, path: "/" });
    return res;
  }

  // ── Role matches required role → allow ─────────────────────────────────────
  if (role === guard.role) {
    return NextResponse.next();
  }

  // ── Wrong role → redirect to own dashboard (or /login if unknown) ──────────
  const ownPath = ROLE_PATHS[role];
  return NextResponse.redirect(new URL(ownPath ?? "/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/student/:path*", "/login"],
};
