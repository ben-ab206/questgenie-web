import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and OTP token are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify OTP and get session
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.session) {
      await supabase.from('users').insert({ email: data.user?.email, name: data.user?.email, user_id: data.user?.id })
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
