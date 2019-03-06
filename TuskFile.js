const tusk = require("tusk");
const fs = require("fs");

// Options.
const buildDir = process.env.BUILD_DIR ? process.env.BUILD_DIR.toLocaleLowerCase() : "./dist";
const versionLock = [8, 11];

const buildOps = [
    {
        name: "verify",
        desc: "Verify the environment.",

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
        name: "prepare",
        desc: "Clean output directory, and install depedencies if applicable.",
        
        callback: async () => {
            // Remove existing output directory (if applicable).
            await tusk.FileOps.forceRemove(buildDir);

            // Depedencies are not installed yet.
            if (!fs.existsSync("node_modules")) {
                // So let's install them.
                return tusk.ScriptOps.npmInstall;
            }
        }
    },
    {
        name: "build",
        desc: "Build the project.",
        callback: () => tusk.ScriptOps.execute("tsc", undefined, true)
    },
    {
        name: "lint",
        desc: "Apply linter.",
        callback: () => tusk.ScriptOps.npx("tslint", ["-c", "tslint.json", "'src/**/*.ts'"], true)
    }
];

Task("build", "Build the project.", buildOps);

Task("deploy", "Publish package to the NPM registry.", [
    // Remove 'lint' step.
    ...buildOps.slice(0, buildOps.length - 1),

    {
        name: "deploy",
        desc: "Publish package to the NPM registry.",
        callback: () => tusk.ScriptOps.npm("publish")
    }
]);
