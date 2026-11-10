/** 
 * @type {import('eslint').Linter.Config[]}
 *
 * ESLint v9.0.0+ configuration. The repository had eslint declared in
 * package.json scripts but no configuration file, causing the lint step
 * to fail. This minimal configuration enables the linter to run.
 */
export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.git/**'],
  },
];
