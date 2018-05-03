<p align="center">
  <img alt="Anvil Logo" src="https://raw.githubusercontent.com/CloudRex/Anvil/master/logo2.png">
  <br />
  <img alt="Build Status" src="https://travis-ci.org/CloudRex/Anvil.svg?branch=master">
  <img alt="NPM Version" src="https://badge.fury.io/js/discord-anvil.svg">
  <img alt="Documentation" src="https://cloudrex.github.io/Anvil/badge.svg">
</p>

<br/>

Anvil is a powerful fully-modular, self-contained bot development framework.

**Note**: Anvil is a Discord client wrapper and not a Discord API library.

=> [Click here to view the NPM package](https://www.npmjs.com/package/discord-anvil)

=> [Click here to view the docs](https://cloudrex.github.io/Anvil/)

*Powering the [Tux](https://github.com/CloudRex/Tux) and [War](https://github.com/CloudRex/War) bots. | Powered by [Discord.js](https://discord.js.org/)*

#### Quick Start

First, make sure to install Anvil: `npm install discord-anvil --save`

index.js:
```js
const { Bot, ObjectAdapter } = require("discord-anvil");
const path = require("path");

// Create the bot
const bot = new Bot({
    paths: {
    	settings: "settings.json",
    	accessLevels: "access-levels.json",
    	commands: path.join(__dirname, "commands")
    },

    argumentTypes: {},
    dataAdapter: new ObjectAdapter()
});

// Connect the client
bot.connect();
```

settings.json: ([Click here](https://discordapp.com/developers/applications/me) to find your bot's token)
```json
{
    "general": {
        "token": "<Your bot's token here>",
        "commandTrigger": "!"
    }
}
```

access-levels.json:
```json
{
	"Guest": [],
	"Member": [
		"@everyone"
	],
	"Premium": [],
	"Moderator": [],
	"Admin": [],
	"Owner": [],
	"Developer": ["<Your Discord user ID here>"]
}
```

commands/hello.js:
```js
const { AccessLevelType, CommandCategoryType } = require("discord-anvil");

// Export the command to be automatically loaded
module.exports = {
	// When the command is executed
	executed(context) {
		context.ok("Hello world!");
	},
	
	// Whether the command can execute in the current state
	canExecute(context) {
		return true;
	},
	
	// Information about the command
	meta: {
		name: "hello", // The name of the command
		description: "Hello world", // The description of the command
		accessLevel: AccessLevelType.Member, // Who can issue this command
		aliases: [], // Aliases of this command
		args: {},
		category: CommandCategoryType.Utility, // The category of the command
		enabled: true // Whether this command is enabled and can be executed
	}
};
```

#### Building
To build the project, use `npm run build`.

To build the docs, use `npm run docs`.

Make sure that you have previously installed the project dependencies (`npm install`).


#### Versioning
When contributing, please follow the [Semantic Versioning](https://semver.org/) guidelines.
