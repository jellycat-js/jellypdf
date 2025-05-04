import { SUPPORTED_ENGINES, SUPPORTED_FORMATS, ALLOWED_OPTION_KEYS, ERROR_TYPES as E } from '@constants'
import { ErrorManager } from '@core/ErrorManager'
import { config as CONFIG } from '@config'
import { TJellyPdfOptions } from '@types'

export class Validator
{
	static validate(options: Partial<TJellyPdfOptions>): TJellyPdfOptions
	{
		CONFIG.verbose && console.log('Validating options...')

		CONFIG.verbose && console.log('Validating input...')
		if (options.input == null) {
			CONFIG.verbose && console.log('Validation failed: Missing required option "input"')
			throw ErrorManager.create(E.CONFIG_INVALID, 'Option "input" is required')
		}

		CONFIG.verbose && console.log('Validating output...')
		if (options.output != undefined && options.output != null && typeof options.output !== 'string') {
			CONFIG.verbose && console.log('Validation failed: Option "output" must be a string or null')
			throw ErrorManager.create(E.CONFIG_INVALID, 'Option "output" must be a string or null')
		}

		CONFIG.verbose && console.log('Validating format...')
		if (options.format && !SUPPORTED_FORMATS.includes(options.format)) {
			CONFIG.verbose && console.log(`Invalid format: ${options.format}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "format" must be one of ${SUPPORTED_FORMATS.join(', ')}`)
		}

		CONFIG.verbose && console.log('Validating engine...')
		if (options.engine && !SUPPORTED_ENGINES.includes(options.engine)) {
			CONFIG.verbose && console.log(`Invalid engine: ${options.engine}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "engine" must be one of ${SUPPORTED_ENGINES.join(', ')}`)
		}

		CONFIG.verbose && console.log('Validating dpi...')
		if (typeof options.dpi !== 'number') {
			CONFIG.verbose && console.log(`Invalid dpi: ${options.dpi}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "dpi" must be a number`)
		}

		CONFIG.verbose && console.log('Validating landscape...')
		if (typeof options.landscape !== 'boolean') {
			CONFIG.verbose && console.log(`Invalid landscape: ${options.landscape}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "landscape" must be a boolean`)
		}

		CONFIG.verbose && console.log('Validating baseMargin...')
		if (typeof options.baseMargin !== 'number') {
			CONFIG.verbose && console.log(`Invalid baseMargin: ${options.baseMargin}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "baseMargin" must be a number`)
		}

		CONFIG.verbose && console.log('Validating verbose...')
		if (typeof options.verbose !== 'boolean') {
			CONFIG.verbose && console.log(`Invalid verbose: ${options.verbose}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "verbose" must be a boolean`)
		}

		CONFIG.verbose && console.log('Validating header...')
		if (options.header !== null && typeof options.header !== 'string') {
			CONFIG.verbose && console.log(`Invalid header: ${options.header}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "header" must be a string or null`)
		}

		CONFIG.verbose && console.log('Validating footer...')
		if (options.footer !== null && typeof options.footer !== 'string') {
			CONFIG.verbose && console.log(`Invalid footer: ${options.footer}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "footer" must be a string or null`)
		}

		CONFIG.verbose && console.log('Validating autoCalcMargin...')
		if (typeof options.autoCalcMargin !== 'boolean') {
			CONFIG.verbose && console.log(`Invalid autoCalcMargin: ${options.autoCalcMargin}`)
			throw ErrorManager.create(E.CONFIG_INVALID, `Option "autoCalcMargin" must be a boolean`)
		}

		const unknownKeys = Object.keys(options).filter(k => !ALLOWED_OPTION_KEYS.includes(k as any))
		if (unknownKeys.length > 0) {
			throw ErrorManager.create(E.CONFIG_INVALID, `Unknown option(s): ${unknownKeys.join(', ')}`)
		}

		return options as TJellyPdfOptions
	}
}