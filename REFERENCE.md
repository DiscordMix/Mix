## Table of Contents
1. [Introduction](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#introduction)
    1. [Notes](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#notes)
2. [Bot](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#bot)
    1. [Creating the bot](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#creating-the-bot)
    2. [Events](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#events)
3. [Commands](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#commands)
    1. [Creating Commands](https://github.com/CloudRex/Anvil/blob/master/REFERENCE.md#creating-commands)

## Introduction
#### Notes

This file is intended to give you an in-depth guide to understanding and working with the Anvil framework.

Here's some basic stuff you should know about Anvil:

* Should be used with [Node.js](https://nodejs.org/en/) **v8.11** (Please refrain from using v9.11).
* Is built using [ECMAScript 6](http://es6-features.org/#Constants) with the [Babel](https://babeljs.io/) transpiler (transpilation required).
* Uses the Discord.js library ([click here](https://discord.js.org/#/docs/main/stable/general/welcome) to view the documentation).
* Is object oriented (most code is based on classes).

## Bot
#### Creating the Bot

Below are the properties you may use to create your bot:

| Property       | Type      | Description                            | Required? | Default value |
|----------------|-----------|----------------------------------------|-----------|---------------|
| paths.settings | string    | The location of your settings file     | **Yes**   | -             |
| paths.commands | string    | The directory containing your commands | **Yes**   | -             |
| paths.emojis   | string    | The location of your emojis file       | No        | null          |
| authStore      | [CommandAuthStore](https://cloudrex.github.io/Anvil/class/src/commands/command-auth-store.js~CommandAuthStore.html) | Your authorization store               | **Yes**   | -             |
| argumentTypes  | object    | Your custom argument types             | No        | {}            |
| dataStore      | [DataStore](https://cloudrex.github.io/Anvil/class/src/data-stores/data-store.js~DataStore.html) | Your data store                        | No        | null          |

Example:

```js
const { Bot, JsonAuthStore, JsonStore } = require("discord-anvil");

const bot = new Bot({
    paths: {
    	settings: "settings.json",
    	commands: "commands",
    	emojis: "emojis.json"
    },
    
    authStore: new JsonAuthStore("auth-schema.json", "auth-store.json"),
    dataStore: new JsonStore("data-store.json")
});

...
```

#### Events

| Name               | Description                              | Event object                                                                                                                            |
|--------------------|------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| commandWillExecute | Fired when before a command will execute | [CommandWillExecuteEvent](https://cloudrex.github.io/Anvil/class/src/events/command-will-execute-event.js~CommandWillExecuteEvent.html) |
| commandExecuted    | Fired after a command has been executed  | [CommandExecutedEvent](https://cloudrex.github.io/Anvil/class/src/events/command-executed-event.js~CommandExecutedEvent.html)           |

Example:

```js
...

bot.on("commandWillExecute", (e) => {
	if (e.command.name === "hello") {
		e.prevent();
		e.context.fail("You may not use this command!");
	}
});
```

## Commands
#### Creating Commands

Commands are automatically loaded as modules. Below are the properties you may use to define your commands:



| Property          | Type                                                                                                                                                                                                                                                                            | Description                                        | Required? | Default value                                                                                                                               |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| meta.name         | string                                                                                                                                                                                                                                                                          | The name of your command                           | **Yes**   | -                                                                                                                                           |
| executed          | function                                                                                                                                                                                                                                                                        | When your command is executed                      | **Yes**   | -                                                                                                                                           |
| canExecute        | function                                                                                                                                                                                                                                                                        | Determine whether your command can execute         | No        | true                                                                                                                                        |
| meta.desc         | string                                                                                                                                                                                                                                                                          | The description of your command                    | No        | "No description provided"                                                                                                                   |
| meta.args         | object                                                                                                                                                                                                                                                                          | The types of arguments that your command accepts   | No        | {}                                                                                                                                          |
| meta.enabled      | boolean                                                                                                                                                                                                                                                                         | Whether your command is enabled                    | No        | true                                                                                                                                        |
| meta.aliases      | array(string)                                                                                                                                                                                                                                                                   | Your command's aliases                             | No        | []                                                                                                                                          |
| restrict.auth     | number                                                                                                                                                                                                                                                                          | The required authorization level of your command   | No        | 0                                                                                                                                           |
| restrict.cooldown | number                                                                                                                                                                                                                                                                          | The required delay between each command execution  | No        | 0                                                                                                                                           |
| restrict.env      | array([ChatEnvironment](https://github.com/CloudRex/Anvil/blob/dce223289fc3337297f9e1d6e0589eb315a0f6e0/src/core/chat-environment.js#L4)) or [ChatEnvironment](https://github.com/CloudRex/Anvil/blob/dce223289fc3337297f9e1d6e0589eb315a0f6e0/src/core/chat-environment.js#L4) | The environments where the command may be executed | No        | [ChatEnvironment](https://github.com/CloudRex/Anvil/blob/dce223289fc3337297f9e1d6e0589eb315a0f6e0/src/core/chat-environment.js#L4).Anywhere |

Example:

```js
module.exports = {
	executed(context) {
		context.ok("Hello world!");
	},
	
	canExecute(context) {
		// Determine whether your command may execute
		
		return true;
	},
	
	meta: {
		name: "hello",
		desc: "Display hello world",
		authLevel: 0,
		args: {},
		enabled: true,
		aliases: ["hi", "hey"]
	}
};
```
