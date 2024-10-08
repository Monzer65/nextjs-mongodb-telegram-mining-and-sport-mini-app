import crypto from "crypto";

export function verifyTelegramWebAppData(
  initData: string,
  botToken: string
): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  urlParams.delete("hash");

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

export function parseInitData(initData: string): Record<string, any> {
  const urlParams = new URLSearchParams(initData);
  const result: Record<string, any> = {};

  for (const [key, value] of urlParams.entries()) {
    if (key === "user" || key === "chat" || key === "receiver") {
      result[key] = JSON.parse(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
