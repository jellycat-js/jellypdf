'use strict'

import puppeteer, { type Browser, type Page } from 'puppeteer'
import PuppeteerHandler from '@handlers/PuppeteerHandler'
import { ErrorManager } from '@core/ErrorManager'
import { readFileUtf8 } from '@core/Utils'

jest.mock('puppeteer')

jest.mock('@core/ErrorManager', () => ({
	ErrorManager: { tryOrThrow: jest.fn() }
}))

jest.mock('@core/Utils', () => ({
	readFileUtf8: jest.fn()
}))

describe('PuppeteerHandler', () => {

	const handler = new PuppeteerHandler()

	const mockPage = {
		goto: jest.fn(),
		pdf: jest.fn(),
		setContent: jest.fn(),
		evaluate: jest.fn()
	}

	const mockBrowser = {
		newPage: jest.fn().mockResolvedValue(mockPage as unknown as Page),
		close: jest.fn()
	}

	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(ErrorManager, 'tryOrThrow').mockImplementation(async (fn, _code, finallyFn?) => {
			try { return await fn() } 
			finally { if (finallyFn) await finallyFn() }
		})
		jest.spyOn(puppeteer, 'launch').mockResolvedValue(mockBrowser as unknown as Browser)
	})

	describe('renderPdf', () => {

		it('should generate a PDF after navigation', async () => {

			const input = 'http://example.com'
			const pdfPath = '/tmp/test.pdf'
			const pdfOptions = { path: pdfPath }

			mockPage.goto.mockResolvedValue(undefined)
			mockPage.pdf.mockResolvedValue(Buffer.from('PDF'))

			const result = await handler.renderPdf(input, pdfOptions)

			expect(result).toBe(pdfPath)
			expect(puppeteer.launch).toHaveBeenCalled()
			expect(mockPage.goto).toHaveBeenCalledWith(input, { waitUntil: 'networkidle0' })
			expect(mockPage.pdf).toHaveBeenCalledWith(pdfOptions)
			expect(mockBrowser.close).toHaveBeenCalled()
		})

		it('should handle navigation error', async () => {

			const input = 'http://example.com'
			const pdfOptions = { path: '/tmp/test.pdf' }

			mockPage.goto.mockRejectedValue(new Error('Navigation failed'))

			await expect(handler.renderPdf(input, pdfOptions))
				.rejects
				.toThrowError('Navigation failed')

			expect(puppeteer.launch).toHaveBeenCalled()
			expect(mockPage.goto).toHaveBeenCalledWith(input, { waitUntil: 'networkidle0' })
			expect(mockBrowser.close).toHaveBeenCalled()
		})

		it('should handle PDF generation error', async () => {

			const input = 'http://example.com'
			const pdfOptions = { path: '/tmp/test.pdf' }

			mockPage.goto.mockResolvedValue(undefined)
			mockPage.pdf.mockRejectedValue(new Error('PDF generation failed'))

			await expect(handler.renderPdf(input, pdfOptions))
				.rejects
				.toThrowError('PDF generation failed')

			expect(puppeteer.launch).toHaveBeenCalled()
			expect(mockPage.goto).toHaveBeenCalledWith(input, { waitUntil: 'networkidle0' })
			expect(mockPage.pdf).toHaveBeenCalledWith(pdfOptions)
			expect(mockBrowser.close).toHaveBeenCalled()
		})
	})

	describe('calcHtmlHeight', () => {

		it('should return height from evaluated HTML', async () => {

			const path = '/some/file.html'
			const htmlContent = '<div style="height:100px"></div>'
			const expectedHeight = 100

			;(readFileUtf8 as jest.Mock).mockReturnValue(htmlContent)
			mockPage.setContent.mockResolvedValue(undefined)
			mockPage.evaluate.mockResolvedValue(expectedHeight)

			const result = await handler.calcHtmlHeight(path)

			expect(readFileUtf8).toHaveBeenCalledWith(path)
			expect(mockPage.setContent).toHaveBeenCalledWith(htmlContent)
			expect(mockPage.evaluate).toHaveBeenCalled()
			expect(result).toBe(expectedHeight)
			expect(mockBrowser.close).toHaveBeenCalled()
		})

		it('should handle setContent error', async () => {

			const path = '/some/file.html'

			;(readFileUtf8 as jest.Mock).mockReturnValue('<div></div>')
			mockPage.setContent.mockRejectedValue(new Error('Failed to set content'))

			await expect(handler.calcHtmlHeight(path))
				.rejects
				.toThrowError('Failed to set content')

			expect(readFileUtf8).toHaveBeenCalledWith(path)
			expect(mockPage.setContent).toHaveBeenCalledWith('<div></div>')
			expect(mockBrowser.close).toHaveBeenCalled()
		})

		it('should handle evaluate error', async () => {

			const path = '/some/file.html'

			;(readFileUtf8 as jest.Mock).mockReturnValue('<div></div>')
			mockPage.setContent.mockResolvedValue(undefined)
			mockPage.evaluate.mockRejectedValue(new Error('Failed to evaluate height'))

			await expect(handler.calcHtmlHeight(path))
				.rejects
				.toThrowError('Failed to evaluate height')

			expect(readFileUtf8).toHaveBeenCalledWith(path)
			expect(mockPage.setContent).toHaveBeenCalledWith('<div></div>')
			expect(mockPage.evaluate).toHaveBeenCalled()
			expect(mockBrowser.close).toHaveBeenCalled()
		})
	})

	describe('getOptionsMap', () => {

		it('should return a map with correct keys and handlers', () => {

			const args = {
				input: 'in.html',
				output: 'out.pdf',
				format: 'A4' as const,
				dpi: 96,
				landscape: false,
				header: '<h1>Header</h1>',
				footer: '<h1>Footer</h1>',
				engine: 'puppeteer' as const,
				autoCalcMargin: true,
				baseMargin: 10,
				verbose: false
			}

			const map = handler.getOptionsMap()

			expect(map.get('path')).toBeDefined()
			expect(map.get('path')!(args)).toBe('out.pdf')

			expect(map.get('format')).toBeDefined()
			expect(map.get('format')!(args)).toBe('A4')

			expect(map.get('printBackground')).toBeDefined()
			expect(map.get('printBackground')!).toBe(true)

			expect(map.get('landscape')).toBeDefined()
			expect(map.get('landscape')!(args)).toBe(false)

			expect(map.get('displayHeaderFooter')).toBeDefined()
			expect(map.get('displayHeaderFooter')!(args)).toBe(true)

			expect(map.get('headerTemplate')).toBeDefined()
			expect(map.get('headerTemplate')!(args)).toBe('<h1>Header</h1>')

			expect(map.get('footerTemplate')).toBeDefined()
			expect(map.get('footerTemplate')!(args)).toBe('<h1>Footer</h1>')

			expect(map.get('margin')).toBeDefined()
			expect(map.get('margin')!(args)).toEqual({
				top: 10,
				bottom: 10,
				left: 10,
				right: 10
			})
		})
	})
})