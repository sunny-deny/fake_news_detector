const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

type RequestOptions = Omit<RequestInit, "body"> & {
  bodyJson?: unknown;
};

function extractErrorMessage(errorData: unknown, status: number): string {
  if (typeof errorData === "string" && errorData.trim()) {
    return errorData;
  }

  if (errorData && typeof errorData === "object" && "detail" in errorData) {
    const detail = (errorData as { detail: unknown }).detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === "string") return item;

          if (
            item &&
            typeof item === "object" &&
            "msg" in item &&
            typeof (item as { msg: unknown }).msg === "string"
          ) {
            return (item as { msg: string }).msg;
          }

          try {
            return JSON.stringify(item);
          } catch {
            return null;
          }
        })
        .filter((message): message is string => Boolean(message && message.trim()));

      if (messages.length > 0) {
        return messages.join(", ");
      }
    }

    if (detail && typeof detail === "object") {
      try {
        return JSON.stringify(detail);
      } catch {
        //
      }
    }
  }

  return `Request failed with status ${status}`;
}

function isResponseWithBody(status: number): boolean {
  return status !== 204 && status !== 205 && status !== 304;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { bodyJson, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: bodyJson !== undefined ? JSON.stringify(bodyJson) : undefined,
  });

  if (!response.ok) {
    let errorData: unknown = null;

    try {
      errorData = await response.json();
    } catch {
      try {
        errorData = await response.text();
      } catch {
        //
      }
    }

    throw new Error(extractErrorMessage(errorData, response.status));
  }

  if (!isResponseWithBody(response.status)) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
