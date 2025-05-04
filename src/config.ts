import { DEFAULT_OPTIONS } from '@constants'

export class Config
{
	private _verbose = DEFAULT_OPTIONS.verbose

	get verbose()
	{
		return this._verbose
	}

	set verbose(value: boolean)
	{
		this._verbose = value
	}
}

export const config = new Config()