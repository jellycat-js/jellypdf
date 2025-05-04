import { type TJellyPdfOptions, type TEngineHandler, type TPdfOptions } from '@types'
import { resolveLocalFile, pxToMm } from '@core/Utils'
import { config as CONFIG } from '@config'

export class Configurator
{
	constructor(
		private args: TJellyPdfOptions, 
		private handler: TEngineHandler
	){}

	get input(): string
	{
		CONFIG.verbose && console.log(`Resolving input file path: ${this.args.input}`)

		return resolveLocalFile(this.args.input)
	}

	async getOptions(): Promise<TPdfOptions>
	{
		const pdfOptions: TPdfOptions = {}

		CONFIG.verbose && console.log('Retrieving options from engine...');

		for(const [key, value] of this.handler.getOptionsMap())
		{
			pdfOptions[key] = typeof value === 'function'
				? value(this.args)
				: value
		}

		if (this.args.autoCalcMargin) {

			if (!!pdfOptions.headerTemplate && pdfOptions.margin?.top !== undefined) {

				const height = await this.handler.calcHtmlHeight(pdfOptions.headerTemplate)
				pdfOptions.margin.top = this.args.baseMargin + pxToMm(height, this.args.dpi)

				CONFIG.verbose && console.log(`Calculated header margin: ${pdfOptions.margin.top}mm`)
			}

			if (!!pdfOptions.footerTemplate && pdfOptions.margin?.bottom !== undefined) {

				const height = await this.handler.calcHtmlHeight(pdfOptions.footerTemplate)
				pdfOptions.margin.bottom = this.args.baseMargin + pxToMm(height, this.args.dpi)

				CONFIG.verbose && console.log(`Calculated footer margin: ${pdfOptions.margin.bottom}mm`)
			}
		}

		if (typeof pdfOptions.margin === 'object' && pdfOptions.margin !== null) {

			pdfOptions.margin = Object.fromEntries(
				Object.entries(pdfOptions.margin).map(
					([key, value]) => [ key, `${value}mm` ]
				)
			)

			CONFIG.verbose && console.log(`Margins adjusted: ${JSON.stringify(pdfOptions.margin)}`)
		}

		return pdfOptions
	}
}