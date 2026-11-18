export type DrapeStylePreset = 'nivi' | 'kasavu' | 'anarkali';
export type DrapeBackdropPreset = 'ivory-atelier' | 'maroon-editorial' | 'daylight-veranda';

export interface GenerateDrapePayload {
  imageDataUrl: string;
  secondaryImageDataUrl?: string;
  category?: string;
  title?: string;
  color?: string;
  fabricDetails?: string;
  drapeStyle?: DrapeStylePreset;
  backdrop?: DrapeBackdropPreset;
  customStylingNote?: string;
}

interface ParsedInlineData {
  mimeType: string;
  data: string;
}

function parseDataUrl(dataUrl: string): ParsedInlineData | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function buildCoutureDrapePrompt(payload: GenerateDrapePayload): string {
  const styleInstructions: Record<DrapeStylePreset, string> = {
    nivi: 'Draped neatly in a classic Indian Nivi sari silhouette over a tailored matching blouse, displaying crisp waist pleats and the full decorative pallu flowing gracefully over the left shoulder.',
    kasavu: 'Draped elegantly in traditional Kerala temple/Kasavu festival style over an ivory/gold-edged blouse, highlighting the border zari selvedge and natural handloom fall.',
    anarkali: 'Styled as a tailored bespoke Indian ethnic ensemble worn gracefully by a boutique fashion model, showing authentic silhouette, neckline embroidery, and dupatta fall.',
  };

  const backdropInstructions: Record<DrapeBackdropPreset, string> = {
    'ivory-atelier': 'Minimal warm ivory linen couture studio backdrop (#FAF8F5 tone) with soft diffused natural side lighting, editorial Sabyasachi/Raw Mango magazine photography look.',
    'maroon-editorial': 'Warm textured royal maroon studio backdrop with subtle soft golden rim lighting and warm ivory flooring.',
    'daylight-veranda': 'Soft sunlit Kerala courtyard veranda with warm teak accents and airy linen curtains in shallow depth of field.',
  };

  const styleText = styleInstructions[payload.drapeStyle || 'nivi'];
  const backdropText = backdropInstructions[payload.backdrop || 'ivory-atelier'];

  return [
    'Create a high-fashion editorial 3:4 portrait photograph of a graceful Indian fashion model wearing the EXACT garment shown in the reference image(s).',
    'STRICT FIDELITY RULES:',
    '- Preserve the exact fabric base color, weave sheen, zari/thread border pattern, body motifs, and pallu design from the reference garment photo(s) without inventing unrelated prints.',
    payload.title ? `- Garment Reference: ${payload.title}.` : '',
    payload.color ? `- Color Palette: ${payload.color}.` : '',
    payload.fabricDetails ? `- Fabric & Texture: ${payload.fabricDetails}.` : '',
    `- Drape & Fit: ${styleText}`,
    `- Setting & Lighting: ${backdropText}`,
    payload.customStylingNote ? `- Additional Styling: ${payload.customStylingNote}.` : '',
    '- Keep composition clean, full torso to lower skirt visible, natural realistic fabric folds, zero text overlays, zero watermarks, zero collage splits.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function generateSariModelDrape(
  payload: GenerateDrapePayload,
  apiKey: string | undefined,
  modelId = 'gemini-2.5-flash-image'
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!apiKey || !apiKey.trim()) {
    return {
      status: 503,
      body: {
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message:
          'AI drape generation requires GEMINI_API_KEY in .env.local (or server environment variables). You can still upload and compress garment photos immediately.',
      },
    };
  }

  if (!payload?.imageDataUrl) {
    return {
      status: 400,
      body: { error: 'MISSING_IMAGE', message: 'Please upload a primary sari/garment photo first.' },
    };
  }

  const primaryImage = parseDataUrl(payload.imageDataUrl);
  if (!primaryImage) {
    return {
      status: 400,
      body: {
        error: 'INVALID_IMAGE_FORMAT',
        message: 'Source garment image must be a base64 data URL (upload a file first).',
      },
    };
  }

  const parts: Array<Record<string, unknown>> = [
    { text: buildCoutureDrapePrompt(payload) },
    { inlineData: { mimeType: primaryImage.mimeType, data: primaryImage.data } },
  ];

  if (payload.secondaryImageDataUrl) {
    const secondaryImage = parseDataUrl(payload.secondaryImageDataUrl);
    if (secondaryImage) {
      parts.push({
        inlineData: { mimeType: secondaryImage.mimeType, data: secondaryImage.data },
      });
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelId
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['IMAGE'],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    return {
      status: response.status,
      body: {
        error: 'AI_PROVIDER_ERROR',
        message: `Gemini API returned ${response.status}. ${errText.slice(0, 220)}`,
      },
    };
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; data?: string };
        }>;
      };
    }>;
  };

  const imagePart = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    return {
      status: 502,
      body: {
        error: 'NO_IMAGE_RETURNED',
        message: 'The AI model did not return an image. Try a clearer flat-lay garment photograph.',
      },
    };
  }

  const outMime = imagePart.inlineData.mimeType || 'image/png';
  return {
    status: 200,
    body: {
      imageDataUrl: `data:${outMime};base64,${imagePart.inlineData.data}`,
      model: modelId,
    },
  };
}

// Vercel / Standard Node Serverless Handler
export default async function handler(
  req: { method?: string; body?: GenerateDrapePayload },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Use POST /api/generate-drape' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelId = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const result = await generateSariModelDrape(req.body || ({} as GenerateDrapePayload), apiKey, modelId);
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: err instanceof Error ? err.message : 'Unexpected server error generating AI drape.',
    });
  }
}
