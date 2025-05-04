#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { JellyPdfError } from '@core/ErrorManager'
import { DEFAULT_OPTIONS, SUPPORTED_FORMATS, SUPPORTED_ENGINES } from '@constants'
import { type TJellyPdfOptions } from '@types'
import { generatePdf } from '@jellypdf'

const defineOptions = (yargs: any)=> {

	return yargs

		.positional('input', {
        	describe: 'URL or HTML file path',
        	type: 'string',
        	demandOption: true
        })

        .positional('output', {
        	describe: 'Path to save the PDF',
        	type: 'string',
        	demandOption: true
    	})

	    .option('header', { 
	        type: 'string',
	        default: DEFAULT_OPTIONS.header, 
	        describe: 'Path to header file'
	    })

	    .option('footer', { 
	        type: 'string',
	        default: DEFAULT_OPTIONS.footer, 
	        describe: 'Path to footer file'
	    })

	    .option('dpi', { 
	        type: 'number',
	        default: DEFAULT_OPTIONS.dpi, 
	        describe: 'DPI for conversion'
	    })

	    .option('format', { 
	        alias: 'f',
	        type: 'string',
	        choices: SUPPORTED_FORMATS,
	        default: DEFAULT_OPTIONS.format,
	        describe: 'Specify the paper format'
	    })

	    .option('landscape', { 
	        alias: 'l',
	        type: 'boolean',
	        default: DEFAULT_OPTIONS.landscape, 
	        describe: 'To print in landscape orientation'
	    })

	    .option('base-margin', { 
	        alias: 'm',
	        type: 'number',
	        default: DEFAULT_OPTIONS.baseMargin,
	        describe: 'Base margin in mm'
	    })

	    .option('engine', { 
	        alias: 'e',
	        type: 'string',
	        choices: SUPPORTED_ENGINES,
	        default: DEFAULT_OPTIONS.engine,
	        describe: 'Engine for generation'
	    })

	    .option('auto-calc-margin', {
            type: 'boolean',
            default: DEFAULT_OPTIONS.autoCalcMargin,
            describe: 'Enable automatic margin calculation based on header/footer'
        })

	    .option('verbose', { 
	        alias: 'v',
	        type: 'boolean',
	        default: DEFAULT_OPTIONS.verbose,
	        describe: 'Enable verbose output'
	    })
}

const runGenerator = async (argv: TJellyPdfOptions) => {

	try
	{
		const { input, output, ...providedOptions } = argv

		const outputPath = await generatePdf(input, output, providedOptions)

		console.log(`PDF successfully generated at: ${outputPath}`)
	}

	catch(err: any)
	{
		if (err instanceof JellyPdfError) {
            process.exit(err.exitCode)
        }

        console.error('An unexpected error occurred:', err)

        process.exit(1)
	}
}

yargs(hideBin(process.argv))

	.scriptName('jellypdf')

	.usage('Usage: $0 <input> <output> [options]')

	.command(
		'$0 <input> <output>',
		'Generate a PDF from a URL or HTML file',
		defineOptions,
		async (argv: any) => await runGenerator(argv as TJellyPdfOptions)
	)

	.parserConfiguration({
	    'camel-case-expansion': true
	  })

	.help().alias('h', 'help')
	.strict()
	.parse()