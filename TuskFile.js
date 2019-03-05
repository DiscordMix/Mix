const tusk = require("tusk");

// Options.
const buildDir = process.env.BUILD_DIR ? process.env.BUILD_DIR.toLocaleLowerCase() : "./dist";
const versionLock = [8, 11];

const buildOps = [
    {
        name: "env",
        description: "Verify the environment.",

        callback: () => {
            const nodeJsVersion = process.version.substr(1).split(".")[0];
            const nodeJsMajor = parseInt(nodeJsVersion);

            if (nodeJsMajor < versionLock[0] || nodeJsMajor > versionLock[1]) {
                console.log(`This script requires NodeJS >=v${versionLock[0]} and <=v${versionLock[1]}`);

                return false;
            }
        }
    },
    {
        name: "clean",
        description: "Clean output directory.",
        callback: () => tusk.FileOps.forceRemove(buildDir)
    },
    {
        name: "build",
        description: "Build the project.",
        callback: () => tusk.ScriptOps.execute("tsc", undefined, true)
    },
    {
        name: "lint",
        description: "Apply linter.",
        callback: () => tusk.ScriptOps.npx("tslint", ["-c", "tslint.json", "'src/**/*.ts'"], true)
    }
];

Task("build", "Build the project.", buildOps);

Task("deploy", "Publish package to the NPM registry.", [
    ...buildOps,

    {
        name: "deploy",
        description: "Publish package to the NPM registry.",
        callback: () => tusk.ScriptOps.npm("publish")
    }
]);
