module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "references-empty": [2, "never"], // must include GitHub issue
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "docs", "style", "refactor", "perf", "test"],
    ],
    "scope-empty": [2, "never"], // required
  },
};
