export const adminImageAllowedTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const adminImageAllowedExtensions = ["jpg", "jpeg", "png", "webp"] as const;
export const adminImageMaxUploadSizeBytes = 5 * 1024 * 1024;

function getFileExtension(fileName: string) {
  return fileName.trim().toLocaleLowerCase("tr-TR").match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

export function formatUploadBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAllowedAdminImageFile(file: File) {
  const mimeType = file.type.trim().toLocaleLowerCase("tr-TR");

  if (adminImageAllowedTypes.includes(mimeType as (typeof adminImageAllowedTypes)[number])) {
    return true;
  }

  return (mimeType === "" || mimeType === "application/octet-stream") && adminImageAllowedExtensions.includes(getFileExtension(file.name) as (typeof adminImageAllowedExtensions)[number]);
}
