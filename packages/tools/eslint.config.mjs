import { getServerConfig } from "@monorepo/tools/eslint";

export default getServerConfig({
	tsconfigRootDir: import.meta.dirname,
});
