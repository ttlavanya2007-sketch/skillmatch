import multer from "multer";

export function errorHandler(error, _request, response, _next) {
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    response.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "The PDF must be 4 MB or smaller." : "The upload could not be processed.",
    });
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error("API request failed.", error.cause ?? error);
  response.status(status).json({
    message: status === 429 || status === 502 || status === 503
      ? error.message
      : status >= 500
        ? "The server could not complete the resume analysis."
        : error.message,
  });
}
