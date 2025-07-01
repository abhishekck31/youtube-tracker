import { NextResponse } from "next/server"
import { supabaseIsReady, supabase, getEducators } from "@/lib/supabase"

/**
 * GET /api/educators
 * • If Supabase is configured → real DB rows
 * • Otherwise → the fallback in-memory data so the UI still works
 */
export async function GET() {
  if (!supabaseIsReady || !supabase) {
    // 👍 Works in preview mode with no secrets
    const data = await getEducators()
    return NextResponse.json(data)
  }

  try {
    const { data, error } = await supabase.from("educators").select("*").order("name")
    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error("Unexpected fetch/parsing error:", err)
    return NextResponse.json({ error: "Supabase unreachable or returned malformed data." }, { status: 500 })
  }
}
