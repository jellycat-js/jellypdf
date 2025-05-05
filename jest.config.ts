import type { Config } from 'jest'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: "jest-environment-node",
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    moduleNameMapper: {
        '^@jellypdf$': '<rootDir>/src/jellypdf.ts',
        '^@config$': '<rootDir>/src/config.ts',
        '^@types$': '<rootDir>/src/types/index.types.ts',
        '^@constants$': '<rootDir>/src/constants.ts',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@handlers/(.*)$': '<rootDir>/src/handlers/$1'
    }
}

export default config