import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const authToken = req.cookies.get("sb-access-token")?.value
    || req.cookies.get("sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, "").replace(/\./g, "-") + "-auth-token")?.value;

  let user = null;
  if (authToken) {
    const { data } = await supabase.auth.getUser(authToken);
    user = data.user;
  }

  if (req.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
