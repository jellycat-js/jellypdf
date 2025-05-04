import { type TEngineHandler, type TPdfOptions, type TJellyPdfOptions, type TPrimitive } from '@types'
import { chromium, type Browser, type Page } from 'playwright-chromium'
import { ErrorManager } from '@core/ErrorManager'
import { ERROR_TYPES as E } from '@constants'
import { config as CONFIG } from '@config'
import { readFileUtf8 } from '@core/Utils'

export default class PlaywrightHandler implements TEngineHandler
{
	static readonly browserOptions = {
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	}

	getOptionsMap(): Map<string, (args: TJellyPdfOptions) => TPrimitive | TPrimitive>
	{
		CONFIG.verbose && console.log('Creating options map for Playwright...')

		const optionsMap = new Map()

		optionsMap.set('path', ({ output }: TJellyPdfOptions) => output)
		optionsMap.set('format', ({ format }: TJellyPdfOptions) => format)
		optionsMap.set('printBackground', true)
		optionsMap.set('landscape', ({ landscape }: TJellyPdfOptions) => landscape) 
		optionsMap.set('displayHeaderFooter', ({ header, footer }: TJellyPdfOptions) => !!header || !!footer)
		optionsMap.set('headerTemplate', ({ header }: TJellyPdfOptions) => header ?? '') 
		optionsMap.set('footerTemplate', ({ footer }: TJellyPdfOptions) => footer ?? '') 
		optionsMap.set('margin', ({ baseMargin }: TJellyPdfOptions) => ({
			top: baseMargin,
			bottom: baseMargin,
			left: baseMargin,
			right: baseMargin,
		}))

		return optionsMap
	}

	async renderPdf(input: string, pdfOptions: TPdfOptions): Promise<string | Buffer>
	{
		CONFIG.verbose && console.log(`Navigating to ${input}...`)

		return this.withBrowser(async (page: Page) => {

			await ErrorManager.tryOrThrow(async () => {
				await page.goto(input, { waitUntil: 'networkidle' })
			}, E.NAVIGATION_ERROR)

			CONFIG.verbose && console.log('Generating PDF...')

			const result = await ErrorManager.tryOrThrow(async () => {
				
				if (pdfOptions.path === null) {
	                delete pdfOptions.path
	                return await page.pdf(pdfOptions)
	            }

                await page.pdf(pdfOptions)
                return pdfOptions.path

			}, E.GENERATION_FAILED)

			CONFIG.verbose && console.log('PDF generation completed.')

			return result
		})
	}

	async calcHtmlHeight(htmlPath: string): Promise<number>
	{
		return await this.withBrowser(async (page: Page) => {

			await ErrorManager.tryOrThrow(async () => {
				await page.setContent(readFileUtf8(htmlPath))
			}, E.SET_CONTENT_FAILED)

			return ErrorManager.tryOrThrow(async () => {
				return await page.evaluate(
					() => document.body.firstElementChild?.getBoundingClientRect().height ?? 0
				)
			}, E.EVALUATE_HEIGHT_FAILED)
		})
	}

	private async withBrowser(callback: (page: Page) => Promise<any>): Promise<any>
	{
		let browser: Browser | null = null

		return await ErrorManager.tryOrThrow(async () => {

			browser = await chromium.launch(PlaywrightHandler.browserOptions)

			const context = await browser.newContext()
			const page = await context.newPage()

			return await callback(page)

		}, E.HANDLER_ERROR, async () => {
			if (browser) await browser.close()
		})
	}
}