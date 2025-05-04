'use strict'

import { ErrorManager, JellyPdfError } from '@core/ErrorManager'
import { DEFAULT_OPTIONS, ERROR_TYPES as E } from '@constants'
import { Validator } from '@core/Validator'
import { config as CONFIG } from '@config'
import { TJellyPdfOptions } from '@types'

jest.mock('@core/ErrorManager', () => ({
	ErrorManager: {
		create: jest.fn()
	}
}))

const mockedErrorManager = jest.mocked(ErrorManager)

describe('Validator', () => {

	const mockVerbose = jest.spyOn(CONFIG, 'verbose', 'get')

	let validOptions: TJellyPdfOptions

	const override = (overrides: Partial<TJellyPdfOptions>): Partial<TJellyPdfOptions> => ({
		...validOptions,
		...overrides
	})

	beforeEach(() => {

		mockVerbose.mockReturnValue(false)

		mockedErrorManager.create.mockClear()

		validOptions = {
			...DEFAULT_OPTIONS,
	    	input: 'file.pdf',
	    	output: 'output.pdf'
	    } as TJellyPdfOptions
	})

	it('should throw an error when a required option is missing', () => {
		const options = override({ input: undefined as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, 'Option "input" is required')
	})

	it('should throw an error when an invalid format is provided', () => {
		const options = override({ format: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('Option \"format\" must be one of'))
	})

	it('should throw an error when an invalid engine is provided', () => {
		const options = override({ engine: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('Option \"engine\" must be one of'))
	})

	it('should throw an error when dpi is not a number', () => {
		const options = override({ dpi: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('dpi'))
	})

	it('should throw an error when landscape is not a boolean', () => {
		const options = override({ landscape: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('landscape'))
	})

	it('should throw an error when baseMargin is not a number', () => {
		const options = override({ baseMargin: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('baseMargin'))
	})

	it('should throw an error when verbose is not a boolean', () => {
		const options = override({ verbose: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('verbose'))
	})

	it('should throw an error when header is not a string or null', () => {
		const options = override({ header: 0 as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('header'))
	})

	it('should throw an error when footer is not a string or null', () => {
		const options = override({ footer: 0 as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('footer'))
	})

	it('should throw an error when autoCalcMargin is not a boolean', () => {
		const options = override({ autoCalcMargin: 'unexpected' as any })
	    expect(() => Validator.validate(options)).toThrow()
	    expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, expect.stringContaining('autoCalcMargin'))
	})

	it('should pass validation for valid options', () => {
		const validatedOptions = Validator.validate(validOptions)
		expect(validatedOptions).toEqual(validOptions)
	})

	it('should throw an error when an unknown option is provided', () => {
		const options = { ...validOptions, unknownOption: 'unexpected' } as Record<string, any>
		expect(() => Validator.validate(options)).toThrow()
		expect(ErrorManager.create).toHaveBeenCalledWith(E.CONFIG_INVALID, 'Unknown option(s): unknownOption')
	})
})
