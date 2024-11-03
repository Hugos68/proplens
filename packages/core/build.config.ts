import { defineBuildConfig } from 'unbuild';

const config = defineBuildConfig({
  entries: ['src/index'],
  outDir: 'dist',
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true
  }
})

export default config;