import { type TJellyPdfOptions, type TEngineHandlerModule, type TEngineHandler, type TEngine } from '@types'
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

		const handlerMap: Record<TEngine, () => Promise<TEngineHandlerModule>> = {
			puppeteer: () => import('../handlers/PuppeteerHandler'),
			playwright: () => import('../handlers/PlaywrightHandler')
		}

		const engine = this.args.engine.toLowerCase() as TEngine

		return await ErrorManager.tryOrThrow(async () => {
			const { default: HandlerClass } = await handlerMap[engine]()
			return new HandlerClass()
		}, E.HANDLER_ERROR)
	}
}