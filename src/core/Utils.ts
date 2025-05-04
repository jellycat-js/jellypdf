import fs from 'node:fs'
import path from 'node:path'
import { MM_PER_INCH } from '@constants'

export const pxToMm = (px: number, dpi: number): number => {
	return (px * MM_PER_INCH) / dpi
}

export const resolveLocalFile = (input: string): string => {
	return fs.existsSync(input) ? `file://${path.resolve(input)}` : input
}

export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const readFileUtf8 = (path: string): string => {
	return fs.readFileSync(path, 'utf-8')
}
