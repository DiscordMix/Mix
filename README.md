<p align="center">
  <img alt="Mix Logo" src="https://raw.githubusercontent.com/discord-mix/mix/dev-2.0/logo-large.png">
  <br />
  <img alt="Build Status" src="https://travis-ci.com/discord-mix/mix.svg?branch=dev-2.0">
  <img alt="NPM Package" src="https://badge.fury.io/js/%40cloudrex%2Fforge.svg">
</p>

<br/>

Mix (previously known as Forge) is a powerful, modular and extensible Discord bot framework for serious bot development.

**Note**: Mix is a library to create bots and not a Discord API library.

#### Useful Links

=> [View the NPM package](https://www.npmjs.com/package/@cloudrex/forge)

=> [View the documentation](https://cloudrex.gitbook.io/forge/) (**Still being written**)

=> [View CLI tool on NPM](https://www.npmjs.com/package/@d.mix/cli)

=> [Example bot](https://github.com/discord-mix/example-bot)

#### Quick Start with the CLI tool (recommended)

Get started quickly with your next Discord bot project by using our CLI tool!

To install and create a template bot in seconds, issue the following commands:

```bash
# Install the CLI utility
$ npm install --global @d.mix/cli
$ mix new bot
$ cd bot

# Install node modules
$ npm install

# Configure your bot
$ npm run config

# Run the bot
$ npm start
```

A bot boilerplate will be created under the `bot` directory.

Congratulations, you are now ready to begin creating your next masterpiece.

#### Installing

To incorporate Mix into an existing project, simply issue the following command:

`$ npm install --save @cloudrex/forge`

Then you may proceed import/require Mix's classes:

```ts
import {Bot, Utils, Store} from "@discord.mix/mix";
```

#### Building

To build the project, use `npm run build` or `yarn build` if using the [Yarn](https://yarnpkg.com/) package manager.

Make sure that you have installed the project dependencies (`npm install` or `yarn`).

#### Features

* Core
    * Generic "fragment" base model for all entities (commands, services, etc.)
    * Deep-loading for fragments
    * Support for regular expression loading
    * Dependency management (commands, services, etc.)
    * Fully modular (through interfaces)
        * Implement custom command handling
        * Basically everything is modular
    * Support for Hot-reloading any module(s) and/or fragment(s)
    * Automatic advanced optimization for large bots
    * Codebase is tested
    * Various syntaxes for creating components/fragments
        * Using decorators
        * Using class members
* Commands
    * Aliases
    * Advanced argument support
        * Flag support (ex. --key or --key="value")
        * Type system with custom type(s) support
            * Mentions (users, channels, etc.)
            * Booleans ("yes", "no", "false", "true", etc.)
    * "Constraints" to limit execution
        * Cooldowns
        * Server permissions (both bot & issuer)
        * Chat environemnt (NSFW, DMs, etc.)
        * Specifics (guild(s), channel(s), member(s), role(s), etc.)
        * Ability to define custom constraints
    * Middleware "Guards" to limit execution
    * Connections "Relays" allow for relaying an execution event across multiple methods
    * Result feedback with reactions
    * Ability to emulate command execution
    * Ability to re-execute upon message edits
    * Support for multiple prefixes (includes regular expression prefixes)
* Services
    * Run in the background
    * Direct access to all the bot's resources and modules
    * *And more ...*
* Tasks
    * Recurring tasks
    * *And more ...*

#### Contributing

Thanks for your interest in helping in the project. To contribute to this project, you will be required to use pull requests.

#### Versioning

When contributing, please follow the [Semantic Versioning](https://semver.org/) guidelines.

#### Additional Notes

Mix is intended for both serious, large scale and simple, elegant bot development, however it may not be suitable for everyone.

If such is the case, it may be worth considering the following fine alternatives:

[Klasa](https://github.com/dirigeants/klasa) by [Dirigeants](https://github.com/dirigeants)

[Commando](https://github.com/discordjs/Commando) by [discordjs](https://github.com/discordjs)

[yamdbf core](https://github.com/yamdbf/core) by [yamdbf team](https://github.com/yamdbf)

#### Helpful Snippets

[Command](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#command)

[Command with arguments](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#command-with-arguments)

[Service](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service)

[Service with event handling](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service-with-event-handling)

[Service handling multiple events with the same action](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service-handling-multiple-events-with-the-same-action)

[Service with disposable resources](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service-with-disposable-resources)

[Forked service](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#forked-service)

[Task](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#task)

[Recurring task](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#recurring-task)

[Serializer](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#serializer)
