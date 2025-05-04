'use strict'

import { ErrorManager, JellyPdfError } from '@core/ErrorManager'
import type { TErrorObject, TErrorCode } from '@types'
import { ERROR_TYPES as E } from '@constants'

describe('ErrorManager', () => {

	const dummyReason = new Error('Dummy reason')

	const UNEXPECTED_CODE = 'DOES_NOT_EXIST' as unknown as TErrorCode
	const UNEXPECTED_ERROR = { exitCode: 0, message: 'Dummy message' } as unknown as TErrorObject

	const EXPECTED_CODE: TErrorCode = 'HANDLER_ERROR'
	const EXPECTED_ERROR: TErrorObject = E[EXPECTED_CODE]

	describe('create', () => {

		it('should throw a JellyPdfError with expected properties', () => {

			const expected = E[EXPECTED_CODE]

			try
			{
				ErrorManager.create(EXPECTED_ERROR, dummyReason)
			}

			catch (err: any)
			{
				expect(err).toBeInstanceOf(JellyPdfError)
				expect(err.code).toBe(EXPECTED_CODE)
				expect(err.origin).toEqual(expect.any(String))
				expect(err.reason).toBe(dummyReason)
				expect(err.exitCode).toBe(expected.exitCode)
				expect(err.message).toContain(expected.message)
				expect(err.stack).toContain('Caused by:')
			}
		})

		it('should fallback to UNKNOWN_ERROR if unknown code', () => {

			const fallback = E.UNKNOWN_ERROR

			try
			{
				ErrorManager.create(UNEXPECTED_ERROR, dummyReason)
			}

			catch (err: any)
			{
				expect(err).toBeInstanceOf(JellyPdfError)
				expect(err.code).toBe('UNKNOWN_ERROR')
				expect(err.exitCode).toBe(fallback.exitCode)
				expect(err.message).toContain(fallback.message)
			}
		})
	})

	describe('tryOrThrow', () => {

		it('should return the result if fn succeeds', async () => {
			const result = await ErrorManager.tryOrThrow(() => 'OK', E.UNKNOWN_ERROR)
			expect(result).toBe('OK')
		})

		it('should call finallyFn even if fn succeeds', async () => {
			const finallyFn = jest.fn()
			const result = await ErrorManager.tryOrThrow(() => 42, E.UNKNOWN_ERROR, finallyFn)
			expect(result).toBe(42)
			expect(finallyFn).toHaveBeenCalled()
		})

		it('should call create and rethrow if fn fails', async () => {

			const spy = jest.spyOn(ErrorManager, 'create').mockImplementation(() => {
				throw new JellyPdfError('UNKNOWN_ERROR', 'Test', dummyReason, 1, 'msg')
			})

			const failingFn = () => {
				throw dummyReason
			}

			await expect(ErrorManager.tryOrThrow(failingFn, E.UNKNOWN_ERROR)).rejects.toThrow(JellyPdfError)
			expect(spy).toHaveBeenCalledWith(E.UNKNOWN_ERROR, dummyReason)
			spy.mockRestore()
		})

		it('should call finallyFn even if fn fails', async () => {

			const finallyFn = jest.fn()
			const failingFn = () => { throw new Error('boom') }

			await expect(
				ErrorManager.tryOrThrow(failingFn, E.UNKNOWN_ERROR, finallyFn)
			).rejects.toThrow()

			expect(finallyFn).toHaveBeenCalled()
		})
	})

	describe('JellyPdfError', () => {

		it('should instantiate with all provided properties', () => {
			
			const code: TErrorCode = 'UNKNOWN_ERROR'
			const origin = 'SomeFunction'
			const reason = new Error('Something went wrong')
			const exitCode = 42
			const message = 'This is an error message'

			const error = new JellyPdfError(code, origin, reason, exitCode, message)

			expect(error).toBeInstanceOf(Error)
			expect(error.name).toBe('JellyPdfError')
			expect(error.code).toBe(code)
			expect(error.origin).toBe(origin)
			expect(error.reason).toBe(reason)
			expect(error.exitCode).toBe(exitCode)
			expect(error.message).toContain(message)
			expect(error.message).toContain(origin)
			expect(error.stack).toContain('Caused by:')
			expect(error.stack).toContain(reason.stack!.split('\n')[0])
		})

		it('should not append stack if reason is not an Error', () => {
			const code: TErrorCode = 'UNKNOWN_ERROR'
			const reason = 'Some string reason'
			const error = new JellyPdfError(code, 'Origin', reason, 1, 'Message')
			expect(error.stack).not.toContain('Caused by:')
		})
	})
})