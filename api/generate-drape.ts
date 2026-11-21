export type AiDrapePose =
  | 'hero-front'
  | 'walking-profile'
  | 'pallu-craft'
  | 'seated-heritage';

export type ModelArchetype =
  | 'kerala-heritage'
  | 'modern-minimalist'
  | 'royal-festive';

export type DrapeStylePreset = 'nivi' | 'kasavu' | 'anarkali';
export type DrapeBackdropPreset = 'ivory-atelier' | 'maroon-editorial' | 'daylight-veranda';

export interface GenerateDrapePayload {
  imageDataUrl?: string;
  imageUrl?: string;
  secondaryImageDataUrl?: string;
  secondaryImageUrl?: string;
  category?: string;
  title?: string;
  color?: string;
  fabricDetails?: string;
  drapeStyle?: DrapeStylePreset;
  backdrop?: DrapeBackdropPreset;
  modelArchetype?: ModelArchetype;
  customStylingNote?: string;
  pose?: AiDrapePose | 'all';
}

export interface GeneratedLook {
  poseId: AiDrapePose;
  title: string;
  description: string;
  role: 'model-drape' | 'garment-flat' | 'pallu-detail' | 'ai-drape';
  imageDataUrl: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface MultiPoseDrapeResponse {
  success: boolean;
  modelUsed: string;
  looks: GeneratedLook[];
  message?: string;
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

async function resolveImageData(
  dataUrl?: string,
  url?: string
): Promise<ParsedInlineData | null> {
  if (dataUrl && dataUrl.startsWith('data:image/')) {
    return parseDataUrl(dataUrl);
  }

  const targetUrl = url || (dataUrl && dataUrl.startsWith('http') ? dataUrl : undefined);
  if (!targetUrl) return null;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { mimeType, data: base64 };
  } catch (err) {
    console.warn('[ResolveImageData] Could not fetch remote URL:', targetUrl, err);
    return null;
  }
}

export const POSE_DEFINITIONS: Record<
  AiDrapePose,
  {
    title: string;
    description: string;
    role: GeneratedLook['role'];
    promptInstruction: string;
  }
> = {
  'hero-front': {
    title: 'Front Full-Length Drape',
    description: 'Standing poised, showcasing full bodice silhouette, crisp pleats, and clean floor-grazing fall.',
    role: 'model-drape',
    promptInstruction:
      'Full-length standing editorial portrait photograph at 50mm lens. The model stands poised with regal grace, facing forward with a soft, confident expression. The garment is draped in flawless crisp pleats falling straight to the floor, displaying the full front silhouette and decorative pallu flowing over the left shoulder.',
  },
  'walking-profile': {
    title: '3/4 Walking Motion Profile',
    description: 'Dynamic in-motion profile capturing fabric fluidity, drape sweep, and natural zari luster.',
    role: 'model-drape',
    promptInstruction:
      'Full-length 3/4 profile dynamic fashion walk in the atelier. Captured mid-stride, showcasing the fluid motion and natural drape of the silk. The pallu billows gently behind her shoulder, capturing the lustrous sheen of the weave under soft directional studio lighting.',
  },
  'pallu-craft': {
    title: 'Pallu & Zari Detail Closeup',
    description: 'Mid-shot framing focusing on intricate border motifs, artisan zari density, and neckline.',
    role: 'pallu-detail',
    promptInstruction:
      'Medium close-up portrait framing from waist up to shoulders. The model lightly touches the selvedge of the ornate pallu, displaying the intricate zari weave, border motifs, and artisan craftsmanship in high crisp detail with shallow depth of field focusing on the textile texture.',
  },
  'seated-heritage': {
    title: 'Seated Heritage Atelier',
    description: 'Graceful seated pose on antique teak bench, highlighting layered pleats and regal presence.',
    role: 'model-drape',
    promptInstruction:
      'Full editorial seated portrait. The model is seated gracefully on an antique Kerala teak cane bench or heritage carved wood seat. The saree pleats fan out artfully across the seat and floor, showing the fullness of the skirt and rich drape of the fabric in an opulent minimalist studio setting.',
  },
};

function buildSinglePosePrompt(
  payload: GenerateDrapePayload,
  poseId: AiDrapePose
): string {
  const poseDef = POSE_DEFINITIONS[poseId];

  const modelArchetypeInstructions: Record<ModelArchetype, string> = {
    'kerala-heritage':
      'Graceful South Indian fashion model with radiant dusky complexion, elegant low hair bun adorned with fresh white jasmine buds, subtle antique matte gold temple jhumkas, and minimal natural editorial makeup.',
    'modern-minimalist':
      'Contemporary Indian high-fashion model with sleek pulled-back hair, subtle pearl drop earrings, clean luminous skin, and refined modern couture poise.',
    'royal-festive':
      'Regal Indian bride/festive couture model with ornate traditional hair styling, antique choker necklace, and majestic celebratory demeanor.',
  };

  const backdropInstructions: Record<DrapeBackdropPreset, string> = {
    'ivory-atelier':
      'Minimalist warm ivory textured linen couture studio backdrop (#FAF8F5 tone) with soft diffused natural daylight, editorial Sabyasachi/Raw Mango luxury magazine aesthetic.',
    'maroon-editorial':
      'Warm royal crimson-maroon studio backdrop with subtle soft golden rim lighting and warm limestone flooring.',
    'daylight-veranda':
      'Sunlit Kerala ancestral courtyard veranda with teak wood pillars, terracotta tiles, and airy muslin curtains in soft bokeh.',
  };

  const drapeStyleInstructions: Record<DrapeStylePreset, string> = {
    nivi: 'Draped neatly in classic Indian Nivi sari silhouette over a tailored matching blouse, displaying crisp waist pleats and the full decorative pallu flowing over the left shoulder.',
    kasavu: 'Draped elegantly in authentic Kerala temple/Kasavu festival style over an ivory/gold-edged blouse, highlighting the border zari selvedge and natural handloom fall.',
    anarkali: 'Tailored bespoke Indian ethnic ensemble worn gracefully by a boutique fashion model, showing authentic silhouette, neckline embroidery, and dupatta fall.',
  };

  const modelText = modelArchetypeInstructions[payload.modelArchetype || 'kerala-heritage'];
  const backdropText = backdropInstructions[payload.backdrop || 'ivory-atelier'];
  const drapeText = drapeStyleInstructions[payload.drapeStyle || 'nivi'];

  return [
    `Create a high-fashion editorial portrait photograph of an elegant model wearing the EXACT garment shown in the reference image(s).`,
    `CAMERA & POSE: ${poseDef.promptInstruction}`,
    `MODEL SPECIFICATION: ${modelText}`,
    `DRAPE & FIT: ${drapeText}`,
    `LIGHTING & SETTING: ${backdropText}`,
    `STRICT GARMENT FIDELITY RULES:`,
    `- Preserve the exact fabric base color, weave sheen, zari/thread border pattern, body motifs, and pallu design from the reference garment photo(s) without inventing unrelated prints.`,
    payload.title ? `- Garment Reference: ${payload.title}.` : '',
    payload.color ? `- Color Palette: ${payload.color}.` : '',
    payload.fabricDetails ? `- Fabric & Texture: ${payload.fabricDetails}.` : '',
    payload.customStylingNote ? `- Stylist Note: ${payload.customStylingNote}.` : '',
    `- Natural realistic fabric folds, zero text overlays, zero watermarks, zero split collage screens.`,
  ]
    .filter(Boolean)
    .join('\n');
}

async function generateSinglePose(
  payload: GenerateDrapePayload,
  poseId: AiDrapePose,
  primaryImage: ParsedInlineData,
  secondaryImage: ParsedInlineData | null,
  apiKey: string,
  modelId: string
): Promise<GeneratedLook> {
  const poseDef = POSE_DEFINITIONS[poseId];

  try {
    const parts: Array<Record<string, unknown>> = [
      { text: buildSinglePosePrompt(payload, poseId) },
      { inlineData: { mimeType: primaryImage.mimeType, data: primaryImage.data } },
    ];

    if (secondaryImage) {
      parts.push({
        inlineData: { mimeType: secondaryImage.mimeType, data: secondaryImage.data },
      });
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
        poseId,
        title: poseDef.title,
        description: poseDef.description,
        role: poseDef.role,
        imageDataUrl: '',
        status: 'failed',
        error: `Gemini API returned ${response.status}. ${errText.slice(0, 160)}`,
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
        poseId,
        title: poseDef.title,
        description: poseDef.description,
        role: poseDef.role,
        imageDataUrl: '',
        status: 'failed',
        error: 'No image data returned from AI model for this pose.',
      };
    }

    const outMime = imagePart.inlineData.mimeType || 'image/png';
    return {
      poseId,
      title: poseDef.title,
      description: poseDef.description,
      role: poseDef.role,
      imageDataUrl: `data:${outMime};base64,${imagePart.inlineData.data}`,
      status: 'success',
    };
  } catch (err) {
    return {
      poseId,
      title: poseDef.title,
      description: poseDef.description,
      role: poseDef.role,
      imageDataUrl: '',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown generation error',
    };
  }
}

/**
 * Editorial Lookbook Mock for Local Dev & Testing when GEMINI_API_KEY is not set.
 */
function getEditorialLookbookMock(): GeneratedLook[] {
  const editorialImages = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80',
  ];

  const poses: AiDrapePose[] = ['hero-front', 'walking-profile', 'pallu-craft', 'seated-heritage'];

  return poses.map((poseId, idx) => ({
    poseId,
    title: POSE_DEFINITIONS[poseId].title,
    description: POSE_DEFINITIONS[poseId].description,
    role: POSE_DEFINITIONS[poseId].role,
    imageDataUrl: editorialImages[idx % editorialImages.length],
    status: 'success',
  }));
}

export const generateSariModelDrape = processMultiPoseDrape;

export async function processMultiPoseDrape(
  payload: GenerateDrapePayload,
  apiKey: string | undefined,
  modelId = 'gemini-2.5-flash-image'
): Promise<{ status: number; body: MultiPoseDrapeResponse }> {
  // 1. Resolve Primary Image Data (Base64 or Remote URL)
  const primaryImage = await resolveImageData(payload.imageDataUrl, payload.imageUrl);
  if (!primaryImage) {
    return {
      status: 400,
      body: {
        success: false,
        modelUsed: modelId,
        looks: [],
        message: 'Please provide at least one flat garment photo (upload or image URL).',
      },
    };
  }

  // 2. Resolve Optional Secondary Image (Pallu / Embroidery Detail)
  const secondaryImage = await resolveImageData(
    payload.secondaryImageDataUrl,
    payload.secondaryImageUrl
  );

  // 3. If API Key is missing, return high-fidelity editorial mock lookbook with warning
  if (!apiKey || !apiKey.trim()) {
    const mockLooks = getEditorialLookbookMock();
    const filtered =
      payload.pose && payload.pose !== 'all'
        ? mockLooks.filter((l) => l.poseId === payload.pose)
        : mockLooks;

    return {
      status: 200,
      body: {
        success: true,
        modelUsed: 'mock-editorial-preview',
        looks: filtered,
        message:
          'GEMINI_API_KEY is not set in environment. Returned editorial studio preview lookbook.',
      },
    };
  }

  // 4. Determine Poses to Generate
  const targetPoses: AiDrapePose[] =
    payload.pose && payload.pose !== 'all'
      ? [payload.pose]
      : ['hero-front', 'walking-profile', 'pallu-craft', 'seated-heritage'];

  // 5. Parallel Batch Generation Across Poses
  const lookPromises = targetPoses.map((poseId) =>
    generateSinglePose(payload, poseId, primaryImage, secondaryImage, apiKey, modelId)
  );

  const results = await Promise.all(lookPromises);
  const anySuccess = results.some((r) => r.status === 'success');

  return {
    status: anySuccess ? 200 : 502,
    body: {
      success: anySuccess,
      modelUsed: modelId,
      looks: results,
      message: anySuccess
        ? `Successfully generated ${results.filter((r) => r.status === 'success').length} editorial looks.`
        : 'Failed to generate editorial looks from AI model.',
    },
  };
}

export default async function handler(
  req: { method?: string; body?: GenerateDrapePayload },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Use POST /api/generate-drape',
    });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelId = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const result = await processMultiPoseDrape(req.body || ({} as GenerateDrapePayload), apiKey, modelId);
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: err instanceof Error ? err.message : 'Unexpected server error in multi-pose AI draper.',
    });
  }
}
