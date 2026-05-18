module.exports = {
  extends: ["prettier"],
  settings: {
    next: {
      rootDir: ["apps/*_/"],
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
};
