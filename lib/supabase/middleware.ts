import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware disabled - allowing all requests through")
  return NextResponse.next()
}
