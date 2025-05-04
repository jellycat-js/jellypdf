import { TJellyPdfOptions } from '@types'

export const MM_PER_INCH = 25.4

export const SUPPORTED_ENGINES = [
	'puppeteer', 
	'playwright'
] as const

export const SUPPORTED_FORMATS = [
	'Letter',
	'Legal',
	'Tabloid',
	'Ledger',
	'A0',
	'A1',
	'A2',
	'A3',
	'A4',
	'A5',
	'A6'
] as const

export const DEFAULT_OPTIONS: Omit<TJellyPdfOptions, 'input' | 'output'> = {
	header: null,
	footer: null,
	dpi: 96,
	format: SUPPORTED_FORMATS[8],
	engine: SUPPORTED_ENGINES[0],
	landscape: false,
	baseMargin: 15,
	autoCalcMargin: true,
	timeout: null,
	verbose: false
} as const

export const ALLOWED_OPTION_KEYS =  [
    ...Object.keys(DEFAULT_OPTIONS),
    'input',
    'output'
] as (keyof typeof DEFAULT_OPTIONS)[]

export const ERROR_TYPES = {

	CONFIG_INVALID: {
		exitCode: 5,
		message: 'Invalid CLI configuration'
	},

	GENERATION_FAILED: {

		exitCode: 2,
		message: 'PDF generation failed'
	},

	NAVIGATION_ERROR: {

		exitCode: 3,
		message: 'Page navigation failed'
	},

	HANDLER_ERROR: {

		exitCode: 4,
		message: 'Engine handler error'
	},

	SET_CONTENT_FAILED: {
		exitCode: 6,
		message: 'Failed to load HTML content into the page'
	},

	EVALUATE_HEIGHT_FAILED: {
		exitCode: 7,
		message: 'Failed to evaluate layout height from HTML content'
	},

	UNKNOWN_ERROR: {
		exitCode: 1,
		message: 'An unknown error occurred'
	}

} as const
