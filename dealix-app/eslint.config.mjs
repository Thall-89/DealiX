import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".cache/**",
    ".next-dealix/**",
    ".next-validation/**",
    ".next-validation-ui/**",
    ".next-validation-final/**",
    ".next-validation-supabase/**",
    ".next-validation-db/**",
    ".next-validation-security/**",
    ".next-validation-security2/**",
    ".next-validation-auth-ui/**",
    ".next-validation-brand/**",
    ".next-validation-health/**",
    ".next-validation-health2/**",
    ".next-validation-brand-final/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
