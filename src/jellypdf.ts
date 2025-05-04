import { ErrorManager, JellyPdfError } from '@core/ErrorManager'
import { DEFAULT_OPTIONS, ERROR_TYPES as E } from '@constants'
import { type TJellyPdfOptions } from '@types'
import { Validator } from '@core/Validator'
import { Generator } from '@core/Generator'
import { config as CONFIG } from '@config'

export async function generatePdf(providedOptions: Partial<TJellyPdfOptions>): Promise<string>
{
    let options: TJellyPdfOptions

    try
    {
        options = Validator.validate({ 
            ...DEFAULT_OPTIONS, 
            ...providedOptions
        })

        CONFIG.verbose = options.verbose

        const generator = new Generator(options)
        
        return await generator.generate()
    }

    catch (err: any)
    {
        let jellyPdfError = err

        if (!(jellyPdfError instanceof JellyPdfError)) {
            jellyPdfError = ErrorManager.create(E.UNKNOWN_ERROR, err)
        }

        if (CONFIG.verbose) {
            console.error(jellyPdfError)
        }

        throw jellyPdfError
    }
}