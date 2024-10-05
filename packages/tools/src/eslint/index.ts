import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import type { ConfigWithExtends } from "typescript-eslint";
import tseslint from "typescript-eslint";

const ignoreConfig: ConfigWithExtends = {
	name: "ignore-config",
	ignores: [
		"node_modules",
		"dist",
		"eslint.config.mjs",
		"prettier.config.mjs",
		"vite.config.ts",
	],
};

const ignoreScripts: ConfigWithExtends = {
	name: "ignore-scripts",
	ignores: ["scripts/migrate.mjs"],
};

type TSConfigArgs = {
	tsconfigRootDir: string;
};

const tsConfig = ({ tsconfigRootDir }: TSConfigArgs): ConfigWithExtends => ({
	name: "typescript-linter",
	plugins: {
		"@typescript-eslint": tseslint.plugin,
	},
	files: ["**/*.ts"],
	languageOptions: {
		// parser: tseslint.parser,
		parserOptions: {
			// projectService: true,
			project: "./tsconfig.json",
			tsconfigRootDir: tsconfigRootDir,
		},
	},
});

const tsBrowserConfig = ({
	tsconfigRootDir,
}: TSConfigArgs): ConfigWithExtends => ({
	name: "typescript-linter",
	plugins: {
		"@typescript-eslint": tseslint.plugin,
	},
	files: ["**/*.{ts,tsx}"],
	languageOptions: {
		ecmaVersion: 2020,
		globals: globals.browser,
		// parser: tseslint.parser,
		parserOptions: {
			// projectService: true,
			project: "./tsconfig.json",
			tsconfigRootDir: tsconfigRootDir,
		},
	},
});

const reactHookConfig: ConfigWithExtends = {
	name: "react-hook",
	plugins: {
		"react-hooks": reactHooks,
	},
	rules: {
		...reactHooks.configs.recommended.rules,
	},
};

const reactRefreshConfig: ConfigWithExtends = {
	name: "react-refresh",
	plugins: {
		"react-refresh": reactRefresh,
	},
	rules: {
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],
	},
};

const simpleImportSortConfig: ConfigWithExtends = {
	name: "simple-import-sort",
	plugins: {
		"simple-import-sort": simpleImportSort,
	},
	rules: {
		"simple-import-sort/imports": "error",
		"simple-import-sort/exports": "error",
	},
};

// const consistentTypesConfig: ConfigWithExtends = {
// 	rules: {
// 		"@typescript-eslint/consistent-type-definitions": ["error", "type"],
// 	},
// };

const getClientConfig = (tsConfigArgs: TSConfigArgs) =>
	tseslint.config(
		ignoreConfig,
		tsBrowserConfig(tsConfigArgs),
		eslint.configs.recommended,
		...tseslint.configs.recommended,
		reactHookConfig,
		reactRefreshConfig,
		simpleImportSortConfig,
		// consistentTypesConfig,
		eslintConfigPrettier
	);

const getServerConfig = (tsConfigArgs: TSConfigArgs) =>
	tseslint.config(
		ignoreConfig,
		ignoreScripts,
		tsConfig(tsConfigArgs),
		eslint.configs.recommended,
		...tseslint.configs.recommended,
		simpleImportSortConfig,
		// consistentTypesConfig,
		eslintConfigPrettier
	);

export { getClientConfig, getServerConfig };
