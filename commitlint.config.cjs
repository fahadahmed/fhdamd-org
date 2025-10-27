module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "references-empty": [2, "never"], // enforce mandatory GitHub issue reference
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "docs", "style", "refactor", "perf", "test"],
    ],
    "scope-empty": [2, "never"], // optional: enforce scope
  },
};
