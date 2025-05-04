import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts}"], 
        plugins: { js }, 
        extends: [
            "js/recommended",
            tseslint.configs.recommended
        ],
        languageOptions: { 
            globals: globals.node
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "off"
        }
    }
])