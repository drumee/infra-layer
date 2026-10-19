"use strict";
const js = require("@eslint/js");
const globals = require("globals");
module.exports = [
  { ignores: ["**/node_modules/**", "**/.cache/**"] },
  { files: ["**/*.{js,cjs,mjs}"], ...js.configs.recommended,
    languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: globals.node },
    rules: { ...js.configs.recommended.rules, "no-unused-vars": "warn" },
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: "error" } },
  { files: ["test/integration/browser-entry.js"], languageOptions: { globals: { ...globals.browser, IL1_BROWSER_RESULT: "readonly", IL1_BOOTSTRAP: "readonly" } } },
  // Reviewed legacy diagnostics remain visible; lint gate rejects any new finding.
  { files: ["capabilities/secrets/index.js", "lifecycle/composition.js"], rules: { "no-control-regex": "warn" } },
  { files: ["lifecycle/external-gateway.js", "test/application/run.js", "test/integration/gateway.test.js", "test/lifecycle/run.js", "test/lifecycle/tracing-driver.js", "test/services/services.test.js"], rules: { "no-empty": "warn" } },
  { files: ["test/services/services.test.js"], rules: { "preserve-caught-error": "warn" } },
  { files: ["test/unit/composition.test.js"], rules: { "getter-return": "warn" } }
];
