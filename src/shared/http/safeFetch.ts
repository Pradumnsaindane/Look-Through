export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export interface SafeFetchResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function safeFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const response = await fetch(input, init);
    const contentType = response.headers.get('content-type') || '';
    let parsed: any = null;

    if (contentType.includes('application/json')) {
      try {
        parsed = await response.json();
      } catch {
        parsed = null;
      }
    } else {
      // Non-JSON response (e.g. Vercel plain text 500 error or HTML gateway error)
      const text = await response.text().catch(() => '');
      if (text.startsWith('{') || text.startsWith('[')) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }
      }
      if (!parsed) {
        const cleanMessage =
          response.status === 404
            ? 'Requested resource not found.'
            : response.status === 401
            ? 'Sign in to continue.'
            : response.status === 403
            ? 'Organization access required. Please check your account permissions.'
            : response.status >= 500
            ? 'The server encountered an error. Please try again shortly.'
            : `Request failed with status ${response.status}.`;

        return {
          ok: false,
          status: response.status,
          error: {
            code: response.status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR',
            message: cleanMessage,
          },
        };
      }
    }

    if (!response.ok || (parsed && parsed.ok === false)) {
      return {
        ok: false,
        status: response.status,
        error: {
          code: parsed?.error?.code || (response.status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR'),
          message: parsed?.error?.message || `Request failed with status ${response.status}.`,
        },
      };
    }

    return {
      ok: true,
      status: response.status,
      data: (parsed?.data !== undefined ? parsed.data : parsed) as T,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network request failed.';
    return {
      ok: false,
      status: 0,
      error: {
        code: 'NETWORK_ERROR',
        message: message.includes('Failed to fetch')
          ? 'Network connection issue. Please verify your connection and retry.'
          : message,
      },
    };
  }
}
