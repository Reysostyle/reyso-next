import { type NextRequest, NextResponse } from "next/server";

// Old product and collection links put the id in the query string
// (shop-details.html?id=..., collection-details.html?category=...).
// Collection slugs are Persian, which a next.config redirect can't put
// into the Location header unencoded, so these are handled here.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isProduct = pathname === "/shop-details.html";
  const value = searchParams.get(isProduct ? "id" : "category");
  const target = value
    ? (isProduct ? "/shop/" : "/collections/") + encodeURIComponent(value)
    : isProduct
      ? "/shop"
      : "/collections";
  return NextResponse.redirect(new URL(target, request.url), 308);
}

export const config = {
  matcher: ["/shop-details.html", "/collection-details.html"],
};
