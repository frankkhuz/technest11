"use client";
import { useState } from "react";
import { validateIMEI } from "@/app/data/gadget";

export function useImeiCheck(onFlaggedStolen: () => void) {
  const [imei, setImei] = useState("");
  const [imeiValid, setImeiValid] = useState<boolean | null>(null);
  const [imeiChecking, setImeiChecking] = useState(false);
  const [imeiReport, setImeiReport] = useState<string | null>(null);

  const handleIMEI = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 15);
    const luhnValid = cleaned.length === 15 ? validateIMEI(cleaned) : null;
    setImei(cleaned);
    setImeiValid(luhnValid);
    setImeiReport(null);

    if (cleaned.length !== 15 || !luhnValid) return;

    setImeiChecking(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: `You are an IMEI verification assistant for a Nigerian gadget marketplace called TechNest. The user has entered IMEI: ${cleaned}. Based on this IMEI, extract what you can from the TAC (first 8 digits: ${cleaned.slice(
                0,
                8
              )}) to identify the device manufacturer and model family. Respond in this exact JSON format only, no markdown: {"manufacturer":"...","model":"...","status":"clean" or "flagged","report":"one sentence","flagged":true or false}`,
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        if (parsed.flagged) {
          setImeiValid(false);
          onFlaggedStolen();
        } else {
          setImeiReport(
            parsed.report ||
              `Device appears to be ${parsed.manufacturer} ${parsed.model} — status: clean.`
          );
        }
      } catch {
        setImeiReport("IMEI format valid — device report unavailable.");
      }
    } catch {
      setImeiReport("IMEI format valid — AI check temporarily unavailable.");
    } finally {
      setImeiChecking(false);
    }
  };

  return { imei, imeiValid, imeiChecking, imeiReport, handleIMEI };
}
