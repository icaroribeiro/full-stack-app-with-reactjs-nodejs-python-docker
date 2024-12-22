class ClientError extends Error {
  public readonly context?: unknown

  constructor(
    message: string,
    details?: { context?: unknown; cause?: unknown },
  ) {
    super(message)
    this.name = this.constructor.name
    this.context = details?.context
    Error.captureStackTrace(this, this.constructor)
  }
}

export { ClientError }
