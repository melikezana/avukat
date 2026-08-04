type UploadFieldErrors = Record<string, string[] | string | undefined>;

type UploadResponseDetails =
  | string
  | {
      fieldErrors?: UploadFieldErrors;
      formErrors?: string[];
      receivedFields?: string[];
    };

export type AdminUploadResponse =
  | {
      ok: true;
      file: {
        name?: string;
        href: string;
        path: string;
        size: number;
        type: string;
      };
    }
  | {
      ok: false;
      error?: string;
      message?: string;
      details?: UploadResponseDetails;
      issues?: Array<{
        message?: string;
      }>;
    };

export function getUploadResponse(responseText: string): AdminUploadResponse | null {
  try {
    return JSON.parse(responseText) as AdminUploadResponse;
  } catch {
    return null;
  }
}

function getDetailsMessage(details: UploadResponseDetails | undefined) {
  if (!details) {
    return undefined;
  }

  if (typeof details === "string") {
    return details;
  }

  const fieldErrorMessages = details.fieldErrors
    ? Object.entries(details.fieldErrors).flatMap(([fieldName, messages]) => {
        const normalizedMessages = Array.isArray(messages) ? messages : messages ? [messages] : [];
        return normalizedMessages.map((message) => `${fieldName}: ${message}`);
      })
    : [];

  if (fieldErrorMessages.length > 0) {
    return fieldErrorMessages.join(" ");
  }

  if (details.formErrors?.length) {
    return details.formErrors.join(" ");
  }

  if (details.receivedFields) {
    return `Alınan alanlar: ${details.receivedFields.join(", ") || "yok"}.`;
  }

  return undefined;
}

export function getUploadErrorMessage(response: AdminUploadResponse | null) {
  if (response?.ok === false) {
    return (
      getDetailsMessage(response.details) ||
      response.issues?.find((issue) => issue.message)?.message ||
      response.error ||
      response.message
    );
  }

  return undefined;
}
