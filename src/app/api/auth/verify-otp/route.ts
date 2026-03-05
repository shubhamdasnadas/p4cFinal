import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { phoneNumber, otp } = await req.json();

    await connectDB();

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    user.otp = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified",
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}