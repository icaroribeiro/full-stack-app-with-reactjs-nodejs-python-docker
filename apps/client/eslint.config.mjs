import { getClientConfig } from '@monorepo/tools/eslint'

export default getClientConfig({
  tsconfigRootDir: import.meta.dirname,
})
