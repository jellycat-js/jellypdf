'use strict'

import { Configurator } from '@core/Configurator'
import { pxToMm, resolveLocalFile } from '@core/Utils'
import { MM_PER_INCH } from '@constants'
import type { TJellyPdfOptions } from '@types'

jest.mock('@core/Utils', () => ({
    resolveLocalFile: jest.fn(),
    pxToMm: jest.fn()
}))

describe('Configurator', () => {

    const baseArgs = {
        input: 'input.html',
        output: 'output.pdf',
        format: 'A4' as const,
        dpi: 96,
        landscape: false,
        header: '<div>header</div>',
        footer: '<div>footer</div>',
        engine: 'puppeteer' as const,
        timeout: 3000,
        autoCalcMargin: true,
        baseMargin: 10,
        verbose: false
    }

    const mockHandler = {
        getOptionsMap: jest.fn(),
        calcHtmlHeight: jest.fn(),
        renderPdf: jest.fn()
    }

    beforeEach(() => {

        jest.clearAllMocks()

        mockHandler.getOptionsMap.mockReturnValue(new Map<string, any>([
            ['path', (args: TJellyPdfOptions) => args.output],
            ['format', (args: TJellyPdfOptions) => args.format],
            ['printBackground', true],
            ['landscape', (args: TJellyPdfOptions) => args.landscape],
            ['displayHeaderFooter', () => true],
            ['headerTemplate', (args: TJellyPdfOptions) => args.header],
            ['footerTemplate', (args: TJellyPdfOptions) => args.footer],
            ['margin', (args: TJellyPdfOptions) => ({
                top: args.baseMargin,
                bottom: args.baseMargin,
                left: args.baseMargin,
                right: args.baseMargin
            })]
        ]))

        ;(resolveLocalFile as jest.Mock).mockImplementation(path => `/absolute/${path}`)
        ;(pxToMm as jest.Mock).mockImplementation((px: number, dpi: number) => px * MM_PER_INCH / dpi)
    })

    it('should resolve input path correctly', () => {
        const configurator = new Configurator(baseArgs, mockHandler)
        expect(configurator.input).toBe('/absolute/input.html')
        expect(resolveLocalFile).toHaveBeenCalledWith('input.html')
    })

    it('should build options and calculate margins when autoCalcMargin is true', async () => {

        mockHandler.calcHtmlHeight
            .mockResolvedValueOnce(100)
            .mockResolvedValueOnce(50)

        const configurator = new Configurator(baseArgs, mockHandler)
        const options = await configurator.getOptions()

        expect(pxToMm).toHaveBeenCalledWith(100, baseArgs.dpi)
        expect(pxToMm).toHaveBeenCalledWith(50, baseArgs.dpi)

        expect(options.margin).toBeDefined()
        expect(options.margin!.top).toBe(`${(10 + pxToMm(100, baseArgs.dpi))}mm`)
        expect(options.margin!.bottom).toBe(`${(10 + pxToMm(50, baseArgs.dpi))}mm`)
        expect(options.margin!.left).toBe(`10mm`)
        expect(options.margin!.right).toBe(`10mm`)
    })

    it('should skip header/footer margin adjustment if templates are missing', async () => {

        const args = {
            ...baseArgs,
            header: null,
            footer: null
        }

        const configurator = new Configurator(args, mockHandler)

        const options = await configurator.getOptions()

        expect(mockHandler.calcHtmlHeight).not.toHaveBeenCalled()
        expect(pxToMm).not.toHaveBeenCalled()
        expect(options.margin).toBeDefined()
        expect(options.margin!.top).toBe(`10mm`)
        expect(options.margin!.bottom).toBe(`10mm`)
    })

    it('should handle non-autoCalcMargin case without calcHtmlHeight call', async () => {

        const args = {
            ...baseArgs,
            autoCalcMargin: false
        }

        const configurator = new Configurator(args, mockHandler)
        const options = await configurator.getOptions()

        expect(mockHandler.calcHtmlHeight).not.toHaveBeenCalled()
        expect(pxToMm).not.toHaveBeenCalled()

        expect(options.margin).toBeDefined()
        expect(options.margin!.top).toBe(`10mm`)
        expect(options.margin!.bottom).toBe(`10mm`)
        expect(options.margin!.left).toBe(`10mm`)
        expect(options.margin!.right).toBe(`10mm`)
    })

    it('should throw if calcHtmlHeight fails on header', async () => {

        mockHandler.calcHtmlHeight.mockRejectedValueOnce(new Error('Header fail'))

        const configurator = new Configurator(baseArgs, mockHandler)

        await expect(configurator.getOptions()).rejects.toThrow('Header fail')

        expect(mockHandler.calcHtmlHeight).toHaveBeenCalledWith(baseArgs.header)
        expect(mockHandler.calcHtmlHeight).toHaveBeenCalledTimes(1)
    })

    it('should throw if calcHtmlHeight fails on footer (after header succeeds)', async () => {

        mockHandler.calcHtmlHeight
            .mockResolvedValueOnce(100)
            .mockRejectedValueOnce(new Error('Footer fail'))

        const configurator = new Configurator(baseArgs, mockHandler)

        await expect(configurator.getOptions()).rejects.toThrow('Footer fail')

        expect(mockHandler.calcHtmlHeight).toHaveBeenNthCalledWith(1, baseArgs.header)
        expect(mockHandler.calcHtmlHeight).toHaveBeenNthCalledWith(2, baseArgs.footer)
    })
})