const fs = require("fs");
const tusk = require("tusk");

// Options.
const buildDir = process.env.BUILD_DIR ? process.env.BUILD_DIR.toLocaleLowerCase() : "dist";
const backupDir = `.${buildDir}.backup`;
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
        name: "clean",
        desc: "Clean project and directories.",

        callback: () => {
            // Remove previous backups (if applicable).
            if (fs.existsSync(backupDir)) {
                return tusk.FileOps.forceRemove(backupDir);
            }
        }
    },
    {
        name: "backup",
        desc: "Backup existing built files.",

        callback: () => {
            // Backup output directory (if applicable).
            if (fs.existsSync(buildDir)) {
                return tusk.FileOps.move(buildDir, backupDir);
            }
        }
    },
    {
        name: "prepare",
        desc: "Install depedencies if applicable.",

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

Task("deploy", "Build and publish package to the NPM registry.", [
    // Remove 'lint' step.
    ...buildOps.slice(0, buildOps.length - 1),

    {
        name: "deploy",
        desc: "Build and publish package to the NPM registry.",
        callback: () => tusk.ScriptOps.npm("publish")
    }
]);

Task("restore", "Restore output directory from a backup.", [
    {
        name: "verify",
        desc: "Verify backup exists.",
        callback: () => fs.existsSync(backupDir)
    },
    {
        name: "clean",
        desc: "Remove existing output directory.",
        callback: () => tusk.FileOps.forceRemove(buildDir)
    },
    {
        name: "restore",
        desc: "Restore output directory from a backup.",
        callback: () => tusk.FileOps.move(backupDir, buildDir)
    }
]);
