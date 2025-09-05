/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateProcessingTime } from "@/lib/utils";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const { url } = await req.json();
    const transcript = await YoutubeTranscript.fetchTranscript(url);

    const processingTime = calculateProcessingTime(startTime);

    return NextResponse.json({
      success: true,
      data: transcript || [],
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
      },
    });
  } catch (error: any) {
    console.error(error);

    const message =
      error?.message?.includes("Transcript is disabled")
        ? "Transcript is not available for this video."
        : "Failed to extract transcript.";

    return createErrorResponse(message, 400, startTime);
  }
}

function createErrorResponse(message: string, status: number, startTime: number) {
  const processingTime = calculateProcessingTime(startTime);

  return NextResponse.json(
    {
      success: false,
      error: message,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
      },
    },
    { status }
  );
}
