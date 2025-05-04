'use strict'

import { generatePdf } from '@jellypdf'
import { ErrorManager, JellyPdfError } from '@core/ErrorManager'
import { Generator } from '@core/Generator'
import { TJellyPdfOptions } from '@types'

jest.mock('@core/ErrorManager', () => {
    const actual = jest.requireActual('@core/ErrorManager')
    return {
        ...actual,
        ErrorManager: {
            ...actual.ErrorManager,
            create: jest.fn()
        },
        JellyPdfError: actual.JellyPdfError
    }
})

const mockGenerate = jest.fn()

jest.mock('@core/Generator', () => ({
    Generator: jest.fn().mockImplementation(() => ({
        generate: mockGenerate
    }))
}))

describe('jellypdf generatePdf', () => {

    const input = 'file.html'
    const output = 'file.pdf'

    const baseArgs: Partial<TJellyPdfOptions> = {
        header: null,
        footer: null,
        dpi: 96,
        format: 'A4',
        landscape: false,
        engine: 'puppeteer',
        baseMargin: 10,
        autoCalcMargin: true,
        verbose: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should instantiate Generator with proper args and call generate()', async () => {

        await generatePdf(input, output, baseArgs)

        expect(Generator).toHaveBeenCalledWith({ input, output, ...baseArgs })
        expect(mockGenerate).toHaveBeenCalled()
    })

    it('should create error and throw if an unknown error occurs', async () => {

        const err = new Error('TEST')
        mockGenerate.mockRejectedValue(err)

        const mockJellyPdfError = new JellyPdfError('UNKNOWN_ERROR', 'JellyPDF', err, 1, 'An unknown error occurred')

        ErrorManager.create = jest.fn().mockReturnValue(mockJellyPdfError)

        const caught = await generatePdf(input, output, baseArgs).catch(e => e)
        expect(caught).toBeInstanceOf(JellyPdfError)
    })

    it('should log error details if verbose is true', async () => {

        const jellyPdfError = new JellyPdfError('CONFIG_INVALID', 'JellyPDF', 'reason', 5, 'Test error')
        mockGenerate.mockRejectedValue(jellyPdfError)

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {})

        await expect(generatePdf(input, output, { ...baseArgs, verbose: true })).rejects.toThrow(jellyPdfError)

        expect(consoleErrorMock).toHaveBeenCalledWith(jellyPdfError)
        consoleErrorMock.mockRestore()
    })
})