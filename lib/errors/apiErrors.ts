// Pimx Agent AI - Comprehensive API & Network Error Resolution Engine

export type ApiErrorKind =
  | 'NETWORK_OFFLINE'
  | 'AUTH_INVALID_KEY'
  | 'RATE_LIMIT_429'
  | 'SERVER_OVERLOAD_503'
  | 'GATEWAY_TIMEOUT_504'
  | 'PERMISSION_FORBIDDEN_403'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'SAFETY_FILTERED'
  | 'BAD_REQUEST_400'
  | 'UNKNOWN_SERVER_500';

export interface ResolvedApiError {
  kind: ApiErrorKind;
  titleFa: string;
  titleEn: string;
  messageFa: string;
  adviceFa: string;
  suggestedAction: 'RETRY' | 'SETTINGS' | 'SWITCH_MODEL' | 'NEW_CHAT' | 'NONE';
  actionLabelFa: string;
  colorClass: string;
  rawError?: string;
  httpStatus?: number;
}

export function resolveApiError(
  rawErrorDetail: string | undefined,
  errorCode?: string
): ResolvedApiError {
  const detail = (rawErrorDetail || '').toLowerCase();
  const code = (errorCode || '').toLowerCase();

  // 1. Network / Internet Connection Errors
  if (
    detail.includes('failed to fetch') ||
    detail.includes('networkerror') ||
    detail.includes('err_internet_disconnected') ||
    detail.includes('network error') ||
    detail.includes('connection refused') ||
    detail.includes('offline') ||
    code === 'network_offline' ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return {
      kind: 'NETWORK_OFFLINE',
      titleFa: 'Your internet connection is down or unstable',
      titleEn: 'Network Offline / Connection Error',
      messageFa: 'The request could not be sent to the server because your internet connection, Wi-Fi, or VPN has been interrupted or disconnected.',
      adviceFa: 'Please check your internet connection or VPN, then click "Retry".',
      suggestedAction: 'RETRY',
      actionLabelFa: 'Retry',
      colorClass: 'rose',
      rawError: rawErrorDetail,
    };
  }

  // 2. Authentication / Invalid API Key (401)
  if (
    detail.includes('api key') ||
    detail.includes('401') ||
    detail.includes('unauthorized') ||
    detail.includes('incorrect api key') ||
    detail.includes('invalid api key') ||
    detail.includes('no api key configured') ||
    code.includes('401')
  ) {
    return {
      kind: 'AUTH_INVALID_KEY',
      titleFa: 'API key is invalid or not configured',
      titleEn: 'Invalid API Key / Unauthorized (401)',
      messageFa: 'The AI provider server rejected the request because the API key is invalid, expired, or empty.',
      adviceFa: 'To fix this, go to "Settings > Providers" and enter a valid API key.',
      suggestedAction: 'SETTINGS',
      actionLabelFa: 'API Key Settings',
      colorClass: 'amber',
      rawError: rawErrorDetail,
      httpStatus: 401,
    };
  }

  // 3. Rate Limit / Quota Exceeded (429)
  if (
    detail.includes('429') ||
    detail.includes('quota') ||
    detail.includes('rate limit') ||
    detail.includes('too many requests') ||
    detail.includes('resource has been exhausted') ||
    detail.includes('insufficient_quota') ||
    code.includes('429')
  ) {
    return {
      kind: 'RATE_LIMIT_429',
      titleFa: 'Request limit or quota exceeded (Rate Limit)',
      titleEn: 'Rate Limit / Quota Exceeded (429)',
      messageFa: 'Your request rate per minute or your free credit quota with the provider has temporarily reached the maximum allowed limit.',
      adviceFa: 'Wait a few seconds and try again, or select a different model (e.g., Gemini Flash or Groq Llama) to continue.',
      suggestedAction: 'SWITCH_MODEL',
      actionLabelFa: 'Switch Model',
      colorClass: 'amber',
      rawError: rawErrorDetail,
      httpStatus: 429,
    };
  }

  // 4. Server Overload / Service Unavailable (503)
  if (
    detail.includes('503') ||
    detail.includes('overloaded') ||
    detail.includes('capacity exceeded') ||
    detail.includes('unavailable') ||
    code.includes('503')
  ) {
    return {
      kind: 'SERVER_OVERLOAD_503',
      titleFa: 'Provider server is overloaded (503)',
      titleEn: 'Model Service Overloaded (503)',
      messageFa: 'The main servers for this AI model are currently experiencing very high global traffic and did not respond.',
      adviceFa: 'You can click Retry in a few seconds, or temporarily select a different AI model.',
      suggestedAction: 'RETRY',
      actionLabelFa: 'Retry',
      colorClass: 'purple',
      rawError: rawErrorDetail,
      httpStatus: 503,
    };
  }

  // 5. Gateway Timeout (504)
  if (
    detail.includes('504') ||
    detail.includes('gateway timeout') ||
    detail.includes('timed out') ||
    code.includes('504')
  ) {
    return {
      kind: 'GATEWAY_TIMEOUT_504',
      titleFa: 'Server response timed out (Gateway Timeout 504)',
      titleEn: 'Gateway Timeout (504)',
      messageFa: 'The server took too long to generate a response and the connection was terminated.',
      adviceFa: 'Try sending your request again with a shorter message, or select a faster model.',
      suggestedAction: 'RETRY',
      actionLabelFa: 'Retry',
      colorClass: 'amber',
      rawError: rawErrorDetail,
      httpStatus: 504,
    };
  }

  // 6. Geographic / IP Block (403 Forbidden)
  if (
    detail.includes('403') ||
    detail.includes('forbidden') ||
    detail.includes('country') ||
    detail.includes('region') ||
    detail.includes('not supported') ||
    code.includes('403')
  ) {
    return {
      kind: 'PERMISSION_FORBIDDEN_403',
      titleFa: 'Geographic access restriction (403 Forbidden)',
      titleEn: 'Region Restricted / Access Forbidden (403)',
      messageFa: 'The service provider has not authorized direct access from your current location or IP address.',
      adviceFa: 'Please set your VPN to an allowed region (e.g., US or Europe) and try again.',
      suggestedAction: 'RETRY',
      actionLabelFa: 'Retry with new IP',
      colorClass: 'rose',
      rawError: rawErrorDetail,
      httpStatus: 403,
    };
  }

  // 7. Context Length Exceeded
  if (
    detail.includes('context length') ||
    detail.includes('maximum context') ||
    detail.includes('too many tokens') ||
    detail.includes('prompt is too long') ||
    detail.includes('token limit')
  ) {
    return {
      kind: 'CONTEXT_LENGTH_EXCEEDED',
      titleFa: 'Message length exceeds model limit',
      titleEn: 'Context Window Exceeded',
      messageFa: 'The total conversation history and attached files exceed the token capacity of the selected model.',
      adviceFa: 'It is recommended to start a new conversation or shorten some of the previous messages.',
      suggestedAction: 'NEW_CHAT',
      actionLabelFa: 'Start New Chat',
      colorClass: 'blue',
      rawError: rawErrorDetail,
    };
  }

  // 8. Content Safety / Moderation Filter
  if (
    detail.includes('safety') ||
    detail.includes('harm_category') ||
    detail.includes('blocked by safety') ||
    detail.includes('content policy') ||
    detail.includes('moderation')
  ) {
    return {
      kind: 'SAFETY_FILTERED',
      titleFa: 'Response blocked by provider safety filter',
      titleEn: 'Content Filtered by Safety Policies',
      messageFa: 'The AI provider\'s safety system determined the generated content violates ethical guidelines and prevented it from being sent.',
      adviceFa: 'Please rephrase your question using different wording and try again.',
      suggestedAction: 'RETRY',
      actionLabelFa: 'Rephrase & Retry',
      colorClass: 'rose',
      rawError: rawErrorDetail,
    };
  }

  // 9. Bad Request / Invalid Parameters (400)
  if (detail.includes('400') || code.includes('400')) {
    return {
      kind: 'BAD_REQUEST_400',
      titleFa: 'Invalid request sent (Bad Request 400)',
      titleEn: 'Invalid Request (400)',
      messageFa: 'The submitted parameters, image dimensions, or prompt structure are not compatible with this model\'s specifications.',
      adviceFa: 'If attaching images, use standard formats (PNG/JPEG), or try sending a simpler prompt.',
      suggestedAction: 'RETRY',
      actionLabelFa: 'Retry',
      colorClass: 'amber',
      rawError: rawErrorDetail,
      httpStatus: 400,
    };
  }

  // 10. Default / Server Error
  return {
    kind: 'UNKNOWN_SERVER_500',
    titleFa: 'Error communicating with AI server',
    titleEn: 'Internal Generation Error',
    messageFa: 'The server encountered an issue during response generation and could not complete the request.',
    adviceFa: 'You can immediately click Retry, or review the connection status and model.',
    suggestedAction: 'RETRY',
    actionLabelFa: 'Retry',
    colorClass: 'rose',
    rawError: rawErrorDetail,
  };
}
