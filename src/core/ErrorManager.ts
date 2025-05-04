import { type TErrorObject, type TErrorCode } from '@types'
import { ERROR_TYPES as E } from '@constants'
import { config as CONFIG } from '@config'

export class ErrorManager {

	static create(errorObject: TErrorObject, reason: unknown): JellyPdfError
	{
		const code = Object.keys(E).find((key) => E[key as keyof typeof E] === errorObject) as TErrorCode

		const { message, exitCode } = code ? E[code] : E.UNKNOWN_ERROR
		const origin = this.getCallerName()

		reason instanceof Error && reason.stack
			? (CONFIG.verbose && console.log(`Error created: ${message} at ${origin} with stack trace: ${reason.stack}`))
			: (CONFIG.verbose && console.log(`Error created: ${message} at ${origin}`))

		return new JellyPdfError(code || 'UNKNOWN_ERROR', origin, reason, exitCode, message)
	}

	static async tryOrThrow<T>(fn: () => Promise<T> | T, errorObject: TErrorObject, finallyFn?: () => Promise<void> | void): Promise<T>
	{
		try
		{
			return await fn()
		} 

		catch(err: any)
		{
			throw ErrorManager.create(errorObject, err)
		}

		finally
		{
			if (finallyFn) await finallyFn()
		}
	}

	private static getCallerName(): string
	{
		const err = new Error()
		const stack = err.stack?.split('\n') ?? []
		const line = stack.find(line => !line.includes('ErrorManager'))
		const match = line?.match(/at (\w+)/)

		return match?.[1] ?? 'Unexpected'
	}
}

export class JellyPdfError extends Error
{
	constructor(
		public readonly code: TErrorCode,
		public readonly origin: string,
		public readonly reason: unknown,
		public readonly exitCode: number,
		message: string
	){
		super(`[${origin}] ${message}`)

		this.name = 'JellyPdfError'

		if (reason instanceof Error && reason.stack) {
			this.stack += '\nCaused by: ' + reason.stack
		}
	}
}