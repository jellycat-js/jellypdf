'use strict'

import fs from 'node:fs'
import path from 'node:path'
import { pxToMm, resolveLocalFile, capitalize, readFileUtf8 } from '@core/Utils'
import { MM_PER_INCH } from '@constants'

describe('Utils', () => {

	describe('pxToMm', () => {

		it('should correctly convert px to mm', () => {
			const dpi = 300
			const px = 600
			const expected = (px * MM_PER_INCH) / dpi
			expect(pxToMm(px, dpi)).toBeCloseTo(expected)
		})
	})

	describe('resolveLocalFile', () => {

		const mockFilePath = '/tmp/test.txt'

		afterEach(() => jest.restoreAllMocks())

		it('should return a file:// path if the file exists', () => {
			jest.spyOn(fs, 'existsSync').mockReturnValue(true)
			const resolved = resolveLocalFile(mockFilePath)
			expect(resolved).toBe(`file://${path.resolve(mockFilePath)}`)
		})

		it('should return the input unchanged if file does not exist', () => {
			jest.spyOn(fs, 'existsSync').mockReturnValue(false)
			const result = resolveLocalFile(mockFilePath)
			expect(result).toBe(mockFilePath)
		})

		it('should handle fs.existsSync throwing', () => {
	    	jest.spyOn(fs, 'existsSync').mockImplementation(() => {
	    		throw new Error('FS error')
	    	})
	    	expect(() => resolveLocalFile(mockFilePath)).toThrow('FS error')
	    })
	})

	describe('capitalize', () => {

		it('should capitalize the first letter of a string', () => {
			expect(capitalize('hello')).toBe('Hello')
		})

		it('should return an empty string if input is empty', () => {
			expect(capitalize('')).toBe('')
		})
	})

	describe('readFileUtf8', () => {

		const mockPath = '/some/file.txt'
    	const mockContent = 'File content'

    	afterEach(() => jest.restoreAllMocks())

		it('should read the file with UTF-8 encoding', () => {
			jest.spyOn(fs, 'readFileSync').mockReturnValue(mockContent)
			const result = readFileUtf8(mockPath)
			expect(fs.readFileSync).toHaveBeenCalledWith(mockPath, 'utf-8')
			expect(result).toBe(mockContent)
		})

		it('should throw if readFileSync fails', () => {
	    	jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
	    		throw new Error('Read error')
	    	})
	    	expect(() => readFileUtf8(mockPath)).toThrow('Read error')
	    })
	})
})