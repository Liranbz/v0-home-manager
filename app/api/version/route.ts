import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Lets us check which build each deployment URL is serving.
export async function GET() {
  return NextResponse.json({
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    repo: process.env.VERCEL_GIT_REPO_SLUG ?? null,
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ? undefined : new Date().toISOString(),
    builtAt: process.env.BUILD_TIME ?? null,
  })
}
