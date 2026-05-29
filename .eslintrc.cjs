module.exports = {
    root: true,
    env: { browser: true, es2022: true, node: true },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: __dirname,
    },
    plugins: ["react", "react-hooks", "react-refresh", "@typescript-eslint", "jsx-a11y", "import"],
    settings: {
        react: { version: "detect" },
        "import/resolver": {
            typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
        },
    },
    rules: {
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "no-console": ["error", { allow: ["warn", "error"] }],
    },
    ignorePatterns: ["dist", "node_modules", "*.config.ts", "*.config.js"],
};
