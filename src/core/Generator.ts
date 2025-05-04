import { type TJellyPdfOptions, type TEngineHandler } from '@types'
import { ErrorManager } from './ErrorManager'
import { Configurator } from './Configurator'
import { ERROR_TYPES as E } from '@constants'
import { config as CONFIG } from '@config'
import { capitalize } from './Utils'

export class Generator
{
	constructor(
		private args: TJellyPdfOptions
	){}

	async generate(): Promise<string>
	{
		CONFIG.verbose && console.log('Starting PDF generation...')

	    const handler = await this.selectHandler()

	    const configurator = new Configurator(this.args, handler)
		const options = await configurator.getOptions()

		CONFIG.verbose && console.log('Generated PDF options:', JSON.stringify(options))

	    return await handler.renderPdf(configurator.input, options)
	}

	private async selectHandler(): Promise<TEngineHandler>
	{
		CONFIG.verbose && console.log(`Selecting handler for engine: ${this.args.engine}`)

		return await ErrorManager.tryOrThrow(async () => {
			const { default: HandlerClass } = await import(`../handlers/${capitalize(this.args.engine)}Handler`)
			return new HandlerClass()
		}, E.HANDLER_ERROR)
	}
}