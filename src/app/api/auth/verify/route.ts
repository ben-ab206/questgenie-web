/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // If verification successful but no session/user, something went wrong
    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: "Verification successful but no session created" },
        { status: 400 }
      );
    }

    // Check if user exists in our database and create if not
    try {
      const isUserExisted = await checkExistUserAlready(supabase, data.user.id);
      
      if (!isUserExisted) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({ 
            email: data.user.email, 
            name: data.user.email, 
            user_id: data.user.id 
          });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          // Don't fail the request - auth is successful, profile creation failed
          // You might want to handle this differently based on your needs
        }
      }
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      // Again, don't fail the auth request for database issues
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

const checkExistUserAlready = async (supabase: any, user_id: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) {
    console.error("Error checking existing user:", error);
    return false; // Assume user doesn't exist if we can't check
  }

  return !!user;
}