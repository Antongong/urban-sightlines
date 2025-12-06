/**
 * NVIDIA VSS (Video Search and Summarization) API Service
 * Connects to the via-server backend for wildlife detection analysis
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

// VSS API base URL (proxied through nginx)
const VSS_BASE_URL = '/api';

/**
 * Check if the VSS backend is ready
 */
export async function checkVSSHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${VSS_BASE_URL}/health/ready`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ready' || response.ok;
  } catch (error) {
    console.error('VSS health check failed:', error);
    return false;
  }
}

/**
 * Upload a video file to VSS for analysis
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

  return response.json();
}

/**
 * Get list of files from VSS
 */
export async function getVSSFiles(): Promise<VSSFile[]> {
  const response = await fetch(`${VSS_BASE_URL}/files?purpose=vision`);
  
  if (!response.ok) {
    throw new Error(`Failed to get files from VSS: ${response.status}`);
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
 */
export async function summarizeVideo(fileId: string): Promise<VSSSummarizeResponse> {
  const response = await fetch(`${VSS_BASE_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: fileId,
      prompt: WILDLIFE_PROMPT,
      caption_summarization_prompt: WILDLIFE_PROMPT,
      summary_aggregation_prompt: WILDLIFE_PROMPT,
      stream: false,
      chunk_duration: 10, // 10 second chunks
      enable_chat: true,
      enable_audio: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to summarize video: ${response.status} - ${errorText}`);
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
                   lowerContent.includes('animal detected');
  
  // Try to extract animal type from the response
  let animalType: string | null = null;
  
  const animalPatterns = [
    /seeing\s+(?:a\s+)?(\w+)/i,
    /detected\s+(?:a\s+)?(\w+)/i,
    /spotted\s+(?:a\s+)?(\w+)/i,
    /observing\s+(?:a\s+)?(\w+)/i,
    /(deer|bear|moose|fox|boar|coyote|raccoon|wolf|elk|mountain lion|cougar|bobcat|lynx|badger|beaver|skunk|opossum|porcupine|squirrel|rabbit|hare)/i,
  ];
  
  for (const pattern of animalPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      animalType = match[1].toLowerCase();
      break;
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
 */
export async function addLiveStreamToVSS(streamUrl: string, description: string): Promise<{ id: string }> {
  const response = await fetch(`${VSS_BASE_URL}/live-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

  return response.json();
}

/**
 * Start wildlife detection alerts for a live stream
 */
export async function addWildlifeAlert(
  liveStreamId: string, 
  alertName: string,
  callbackUrl?: string
): Promise<{ id: string }> {
  const response = await fetch(`${VSS_BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: alertName,
      liveStreamId: liveStreamId,
      events: ['wild animal detected'],
      callback: callbackUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add alert: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get recent alerts
 */
export async function getRecentAlerts(liveStreamId?: string): Promise<any[]> {
  const url = liveStreamId 
    ? `${VSS_BASE_URL}/alerts/recent?live_stream_id=${liveStreamId}`
    : `${VSS_BASE_URL}/alerts/recent`;
    
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to get alerts: ${response.status}`);
  }

  return response.json();
}
