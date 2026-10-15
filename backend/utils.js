export function createHttpError(status, message, options) {
  return Object.assign(new Error(message, options), { status });
}

export function getResumeFilename(originalName) {
  const filename = originalName.split(/[\\/]/).pop().replace(/[\u0000-\u001f]/g, "").slice(0, 180);
  return filename || "resume.pdf";
}

export function isPdfFile(buffer) {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}
