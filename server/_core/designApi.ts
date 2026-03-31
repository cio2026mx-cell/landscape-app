import { ENV } from "./env";
import { storagePut } from "server/storage";

export type RemoveBackgroundOptions = {
  image: string; // URL or Base64
};

export type RemoveBackgroundResponse = {
  url: string;
};

export async function removeBackground(
  options: RemoveBackgroundOptions
): Promise<RemoveBackgroundResponse> {
  const apiKey = ENV.wavespeedApiKey;
  if (!apiKey) {
    throw new Error("WAVESPEED_API_KEY is not configured");
  }

  // 1. Submit the request to WaveSpeed AI
  // We use sync mode for simplicity in this implementation
  const response = await fetch("https://api.wavespeed.ai/api/v3/wavespeed-ai/image-background-remover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      image: options.image,
      enable_sync_mode: true,
      enable_base64_output: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `WaveSpeed AI request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  const result = (await response.json()) as any;
  console.log("[WaveSpeed AI] Response received:", JSON.stringify(result));

  const data = result.data || result;
  // Some versions of the API might return the URL directly or in different formats
  let outputUrl: string | undefined;

  if (data.status === "completed" && data.outputs && data.outputs.length > 0) {
    outputUrl = data.outputs[0];
  } else if (data.output_url) {
    outputUrl = data.output_url;
  } else if (data.url) {
    outputUrl = data.url;
  }

  if (!outputUrl) {
    throw new Error(`WaveSpeed AI processing failed or returned no output. Status: ${data.status || 'unknown'}. Response: ${JSON.stringify(result)}`);
  }

  // 2. Download the result and save it to our storage (S3)
  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to download processed image from WaveSpeed AI");
  }
  
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const mimeType = imageResponse.headers.get("content-type") || "image/png";

  const { url } = await storagePut(
    `design/${Date.now()}_no_bg.png`,
    buffer,
    mimeType
  );

  return {
    url,
  };
}
