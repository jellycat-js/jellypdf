'use strict'

import { Generator } from '@core/Generator'
import { Configurator } from '@core/Configurator'
import { ErrorManager } from '@core/ErrorManager'
import { ERROR_TYPES as E } from '@constants'
import { TEngineHandler } from '@types'

jest.mock('@core/ErrorManager', () => ({
    ErrorManager: {
        tryOrThrow: jest.fn()
    }
}))

const mockHandler: TEngineHandler = {
    renderPdf: jest.fn().mockResolvedValue('/absolute/output.pdf'),
    getOptionsMap: jest.fn(),
    calcHtmlHeight: jest.fn()
}

describe('Generator', () => {

    const baseArgs = {
        input: 'input.html',
        output: 'output.pdf',
        format: 'A4' as const,
        dpi: 96,
        landscape: false,
        engine: 'puppeteer' as const,
        autoCalcMargin: false,
        baseMargin: 10,
        verbose: false,
        header: null,
        footer: null
    }

    beforeEach(() => jest.clearAllMocks())

    it('should generate PDF successfully', async () => {

        const mockTryOrThrow = ErrorManager.tryOrThrow as jest.Mock
        mockTryOrThrow.mockImplementation(async fn => await fn())

        const originalSelectHandler = (Generator as any).prototype['selectHandler']
        ;(Generator as any).prototype['selectHandler'] = async function (this: any) {
            return mockHandler
        }

        jest.spyOn(Configurator.prototype, 'getOptions').mockResolvedValue({
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
        })

        const expectedPdfPath = '/fake/path/output.pdf'
        mockHandler.renderPdf.mockResolvedValue(expectedPdfPath)

        const generator = new Generator(baseArgs)
        const result = await generator.generate()

        expect(mockHandler.renderPdf).toHaveBeenCalled()
        expect(result).toBe(expectedPdfPath)

        ;(Generator as any).prototype['selectHandler'] = originalSelectHandler
    })

    it('should throw if handler import fails', async () => {

        const error = new Error('Cannot load handler')

        const mockTryOrThrow = ErrorManager.tryOrThrow as jest.Mock
        mockTryOrThrow.mockImplementation(async (_, type) => {
            throw new Error(`${type}:${error.message}`)
        })

        const generator = new Generator(baseArgs)

        await expect(generator.generate()).rejects.toThrow(`${E.HANDLER_ERROR}:Cannot load handler`)
    })

    it('should throw if renderPdf fails', async () => {

        const renderError = new Error('Render failed')

        const mockTryOrThrow = ErrorManager.tryOrThrow as jest.Mock
        mockTryOrThrow.mockImplementation(async (fn) => await fn())

        const originalSelectHandler = (Generator as any).prototype['selectHandler']
        ;(Generator as any).prototype['selectHandler'] = async function (this: any) {
            return {
                ...mockHandler,
                renderPdf: jest.fn().mockRejectedValue(renderError)
            }
        }

        jest.spyOn(Configurator.prototype, 'getOptions').mockResolvedValue({})

        const generator = new Generator(baseArgs)

        await expect(generator.generate()).rejects.toThrow(renderError)

        ;(Generator as any).prototype['selectHandler'] = originalSelectHandler
    })

    it('should generate PDF as a Buffer when output is omitted', async () => {
        
        const mockTryOrThrow = ErrorManager.tryOrThrow as jest.Mock
        mockTryOrThrow.mockImplementation(async fn => await fn())

        const originalSelectHandler = (Generator as any).prototype['selectHandler']
        ;(Generator as any).prototype['selectHandler'] = async function (this: any) {
            return mockHandler
        }

        jest.spyOn(Configurator.prototype, 'getOptions').mockResolvedValue({
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
        })

        const expectedBuffer = Buffer.from('pdf-content')
        mockHandler.renderPdf.mockResolvedValue(expectedBuffer)

        const generator = new Generator({ ...baseArgs, output: null })
        const result = await generator.generate()

        expect(mockHandler.renderPdf).toHaveBeenCalled()
        expect(result).toBeInstanceOf(Buffer)

        ;(Generator as any).prototype['selectHandler'] = originalSelectHandler
    })

    it('should generate PDF and save to the specified path', async () => {
        
        const mockTryOrThrow = ErrorManager.tryOrThrow as jest.Mock
        mockTryOrThrow.mockImplementation(async fn => await fn())

        const originalSelectHandler = (Generator as any).prototype['selectHandler']
        ;(Generator as any).prototype['selectHandler'] = async function (this: any) {
            return mockHandler
        }

        jest.spyOn(Configurator.prototype, 'getOptions').mockResolvedValue({
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
        })

        const expectedPdfPath = '/fake/path/output.pdf'
        mockHandler.renderPdf.mockResolvedValue(expectedPdfPath)

        const generator = new Generator({ ...baseArgs, output: 'output.pdf' })
        const result = await generator.generate()

        expect(mockHandler.renderPdf).toHaveBeenCalled()
        expect(result).toBe(expectedPdfPath)

        ;(Generator as any).prototype['selectHandler'] = originalSelectHandler
    })
})