import { SUPPORTED_ENGINES, SUPPORTED_FORMATS, ERROR_TYPES } from '@constants'

export type TPrimitive = string | number | boolean | symbol | bigint | null | undefined

export type TEngine = typeof SUPPORTED_ENGINES[number]

export type TPdfFormat = typeof SUPPORTED_FORMATS[number]

export type TErrorCode = keyof typeof ERROR_TYPES

export type TErrorObject = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES]

export type TJellyPdfOptions = {
	input: string
	output?: string | null
	header: string | null
	footer: string | null
	dpi: number
	format: TPdfFormat
	engine: TEngine
	landscape: boolean
	baseMargin: number
	autoCalcMargin: boolean
	verbose: boolean
}

export interface TPdfOptions
{
	path?: string
	format?: TPdfFormat
	landscape?: boolean
	printBackground?: boolean
	margin?: {
		top?: string | number
		right?: string | number
		bottom?: string | number
		left?: string | number
	}
	displayHeaderFooter?: boolean
	headerTemplate?: string
	footerTemplate?: string
	[key: string]: any 
}

export interface TEngineHandler
{
	getOptionsMap(): Map<string, (args: TJellyPdfOptions) => TPrimitive | TPrimitive>
	renderPdf(input: string, pdfOptions: TPdfOptions): Promise<string | Buffer>
	calcHtmlHeight(htmlPath: string): Promise<number>
}

export type TEngineHandlerModule = { default: new () => TEngineHandler }