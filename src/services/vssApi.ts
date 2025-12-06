/**
 * NVIDIA VSS (Video Search and Summarization) API Service
 * Connects to the via-server backend for wildlife detection analysis
 * 
 * API Reference: https://docs.nvidia.com/vss/latest/content/API_doc.html
 */

export interface VSSFile {
  id: string;
  filename: string;
  bytes: number;
  created_at: number;
  purpose: string;
  object: string;
}

export interface VSSSummarizeResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface VSSAnalysisResult {
  fileId: string;
  summary: string;
  wildlifeDetected: boolean;
  animalType: string | null;
  timestamp: Date;
  rawResponse: VSSSummarizeResponse;
}

// The wildlife detection prompt
const WILDLIFE_PROMPT = `Your only purpose is to determine whether a wild animal is in the video you're analyzing, so dogs and cats don't count, but all wild undomesticated animals do. If an animal is found only respond with a wild animal has been detected. Or a wild animal has not been detected. Also tell us what type of animal you're seeing`;

// VSS API base URL (proxied through nginx in production)
const VSS_BASE_URL = '/api';

/**
 * Helper to check if response is JSON
 */
function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType !== null && contentType.includes('application/json');
}

/**
 * Check if the VSS backend is ready
 * Uses /health/ready endpoint as per VSS API docs
 */
export async function checkVSSHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${VSS_BASE_URL}/health/ready`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    // Check if we got a valid response
    if (!response.ok) {
      console.warn('VSS health check returned non-OK status:', response.status);
      return false;
    }
    
    // Check if response is JSON (via-server returns JSON, Vite dev server returns HTML)
    if (!isJsonResponse(response)) {
      console.warn('VSS health check returned non-JSON response (VSS backend not available)');
      return false;
    }
    
    const data = await response.json();
    // VSS returns { "status": "ready" } when healthy
    return data.status === 'ready' || data.ready === true;
  } catch (error) {
    console.error('VSS health check failed:', error);
    return false;
  }
}

/**
 * Upload a video file to VSS for analysis
 * Uses /files endpoint with purpose="vision" and media_type="video"
 */
export async function uploadVideoToVSS(file: File): Promise<VSSFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'vision');
  formData.append('media_type', 'video');

  const response = await fetch(`${VSS_BASE_URL}/files`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload file to VSS: ${response.status} - ${errorText}`);
  }

  if (!isJsonResponse(response)) {
    throw new Error('VSS returned invalid response format. Is the VSS backend running?');
  }

  return response.json();
}

/**
 * Get list of files from VSS
 */
export async function getVSSFiles(): Promise<VSSFile[]> {
  const response = await fetch(`${VSS_BASE_URL}/files?purpose=vision`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get files from VSS: ${response.status}`);
  }

  if (!isJsonResponse(response)) {
    throw new Error('VSS returned invalid response format');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Delete a file from VSS
 */
export async function deleteVSSFile(fileId: string): Promise<void> {
  const response = await fetch(`${VSS_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file from VSS: ${response.status}`);
  }
}

/**
 * Summarize a video file for wildlife detection
 * Uses /summarize endpoint with custom prompts
 * 
 * Parameters sent:
 * - prompt: Main summarization prompt
 * - caption_summarization_prompt: Prompt for caption summarization
 * - summary_duration: -1 for processing till end of stream (for files, processes entire video)
 */
export async function summarizeVideo(fileId: string): Promise<VSSSummarizeResponse> {
  const response = await fetch(`${VSS_BASE_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      id: fileId,
      prompt: WILDLIFE_PROMPT,
      caption_summarization_prompt: WILDLIFE_PROMPT,
      summary_duration: -1, // Process entire video (-1 = until EOS)
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to summarize video: ${response.status} - ${errorText}`);
  }

  if (!isJsonResponse(response)) {
    throw new Error('VSS returned invalid response format. Is the VSS backend running?');
  }

  return response.json();
}

/**
 * Use chat/completions for Q&A on a video file
 */
export async function chatWithVideo(fileId: string, question: string): Promise<VSSSummarizeResponse> {
  const response = await fetch(`${VSS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      id: fileId,
      messages: [
        { role: 'user', content: question }
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to query video: ${response.status} - ${errorText}`);
  }

  if (!isJsonResponse(response)) {
    throw new Error('VSS returned invalid response format');
  }

  return response.json();
}

/**
 * Parse the VSS response to extract wildlife detection results
 */
export function parseWildlifeDetection(response: VSSSummarizeResponse): { detected: boolean; animalType: string | null } {
  const content = response.choices?.[0]?.message?.content || '';
  const lowerContent = content.toLowerCase();
  
  const detected = lowerContent.includes('wild animal has been detected') || 
                   lowerContent.includes('wildlife detected') ||
                   lowerContent.includes('animal detected') ||
                   lowerContent.includes('detected a') ||
                   lowerContent.includes('i can see');
  
  // Try to extract animal type from the response
  let animalType: string | null = null;
  
  const animalPatterns = [
    /seeing\s+(?:a\s+)?(\w+)/i,
    /detected\s+(?:a\s+)?(\w+)/i,
    /spotted\s+(?:a\s+)?(\w+)/i,
    /observing\s+(?:a\s+)?(\w+)/i,
    /there\s+is\s+(?:a\s+)?(\w+)/i,
    /can\s+see\s+(?:a\s+)?(\w+)/i,
    /(deer|bear|moose|fox|boar|coyote|raccoon|wolf|elk|mountain lion|cougar|bobcat|lynx|badger|beaver|skunk|opossum|porcupine|squirrel|rabbit|hare|wild boar|wild pig)/i,
  ];
  
  for (const pattern of animalPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const potentialAnimal = match[1].toLowerCase();
      // Filter out common non-animal words
      if (!['wild', 'the', 'a', 'an', 'this', 'that'].includes(potentialAnimal)) {
        animalType = potentialAnimal;
        break;
      }
    }
  }
  
  return { detected, animalType };
}

/**
 * Full workflow: Upload video, analyze, and return results
 */
export async function analyzeVideoForWildlife(file: File): Promise<VSSAnalysisResult> {
  // Step 1: Upload the file
  const uploadedFile = await uploadVideoToVSS(file);
  
  // Step 2: Run summarization/analysis
  const summarizeResponse = await summarizeVideo(uploadedFile.id);
  
  // Step 3: Parse results
  const { detected, animalType } = parseWildlifeDetection(summarizeResponse);
  
  return {
    fileId: uploadedFile.id,
    summary: summarizeResponse.choices?.[0]?.message?.content || 'No analysis available',
    wildlifeDetected: detected,
    animalType,
    timestamp: new Date(),
    rawResponse: summarizeResponse,
  };
}

/**
 * Add a live stream to VSS for monitoring
 * Uses /live-stream endpoint
 */
export async function addLiveStreamToVSS(streamUrl: string, description: string): Promise<{ id: string }> {
  const response = await fetch(`${VSS_BASE_URL}/live-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      liveStreamUrl: streamUrl,
      description: description,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add live stream to VSS: ${response.status} - ${errorText}`);
  }

  if (!isJsonResponse(response)) {
    throw new Error('VSS returned invalid response format');
  }

  return response.json();
}

/**
 * Get all live streams from VSS
 */
export async function getLiveStreams(): Promise<any[]> {
  const response = await fetch(`${VSS_BASE_URL}/live-stream`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get live streams: ${response.status}`);
  }

  if (!isJsonResponse(response)) {
    return [];
  }

  return response.json();
}

/**
 * Delete a live stream from VSS
 */
export async function deleteLiveStream(streamId: string): Promise<void> {
  const response = await fetch(`${VSS_BASE_URL}/live-stream/${streamId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete live stream: ${response.status}`);
  }
}

/**
 * Add wildlife detection alert for a live stream
 * Uses /alerts endpoint
 */
export async function addWildlifeAlert(
  liveStreamId: string, 
  alertName: string,
  callbackUrl?: string
): Promise<{ id: string }> {
  const body: Record<string, unknown> = {
    name: alertName,
    liveStreamId: liveStreamId,
    events: ['wild animal detected', 'wildlife', 'deer', 'bear', 'moose', 'fox', 'boar'],
  };

  if (callbackUrl) {
    body.callback = callbackUrl;
  }

  const response = await fetch(`${VSS_BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add alert: ${response.status} - ${errorText}`);
  }

  if (!isJsonResponse(response)) {
    throw new Error('VSS returned invalid response format');
  }

  return response.json();
}

/**
 * Get all configured alerts
 */
export async function getAlerts(): Promise<any[]> {
  const response = await fetch(`${VSS_BASE_URL}/alerts`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get alerts: ${response.status}`);
  }

  if (!isJsonResponse(response)) {
    return [];
  }

  return response.json();
}

/**
 * Get recent alerts (triggered alerts)
 */
export async function getRecentAlerts(liveStreamId?: string): Promise<any[]> {
  const url = liveStreamId 
    ? `${VSS_BASE_URL}/alerts/recent?live_stream_id=${liveStreamId}`
    : `${VSS_BASE_URL}/alerts/recent`;
    
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get recent alerts: ${response.status}`);
  }

  if (!isJsonResponse(response)) {
    return [];
  }

  return response.json();
}

/**
 * Delete an alert
 */
export async function deleteAlert(alertId: string): Promise<void> {
  const response = await fetch(`${VSS_BASE_URL}/alerts/${alertId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete alert: ${response.status}`);
  }
}
