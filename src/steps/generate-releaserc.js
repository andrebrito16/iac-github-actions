const fs = require("fs");
const path = require("path");

module.exports = function ({ defaultBranch = "master", files = [] }) {
  let releaseFile = {
    defaultBranch,
    branches: [
      // tags
      "+([0-9])?(.{+([0-9]),x}).x",

      // default branch
      defaultBranch,

      // alpha
      "next",
      "next-major",
      { name: "beta", prerelease: true },
      { name: "alpha", prerelease: true },

      // git-flow
      "bug/*",
      "bugfix/*",
      "release/*",
      "feature/*",
    ],
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          npmPublish: false,
        },
      ],
      [
        "@semantic-release/git",
        {
          assets: ["docs", "README.md", "CHANGELOG.md", ...files],
          message:
            "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
        },
      ],
      [
        "@semantic-release/github",
        {
          assets: ["dist/**/*.{js,css,py}", ...files],
        },
      ],
    ],
  };

  releaseFile = JSON.stringify(releaseFile, null, 2);

  fs.writeFileSync(path.join(process.cwd(), ".releaserc.json"), releaseFile);

  return releaseFile;
};
