Mix (previously known as Forge) is a powerful, modular and extensible Discord bot framework for serious bot development.

**Note**: Mix is a library to create bots and not a Discord API wrapper library.

**Note**: This project has not yet reached a stable point, and not all functionality will work as expected.

#### Useful Links

* [View the NPM package](https://www.npmjs.com/package/@cloudrex/forge)<br />
* [View the documentation](https://cloudrex.gitbook.io/forge/) (**Still being written**)<br />
* [View CLI utility on NPM](https://www.npmjs.com/package/d.mix.cli)<br />
* [Example bot](https://github.com/discord-mix/example-bot)<br />

## 🍭 Quick Start with the CLI utility (recommended)

Get started quickly with your next Discord bot project by using our CLI tool!

To install and create a template bot in seconds, issue the following commands:

```shell
# Install the CLI utility
$ npm install --global d.mix.cli
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

```shell
$ npm install --save d.mix
```

This will add Mix to your project's dependencies. You may now proceed to import/require Mix's classes and utilities:

```ts
import {Bot, Util} from "d.mix";
```

#### Building

To build the project, use `npm run build` or `yarn build` if using the [Yarn](https://yarnpkg.com/) package manager.

Make sure that you have installed the project dependencies (`npm install` or `yarn`).

#### Contributing

Thanks for your interest in helping in the project. To contribute to this project, you will be required to use pull requests.

#### Helpful Snippets

* Commands
    * [Command](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#command)<br />
    * [Command with arguments](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#command-with-arguments)<br />
* Services
    * [Service](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service)<br />
    * [Service with event handling](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service-with-event-handling)<br />
    * [Service handling multiple events with the same action](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service-handling-multiple-events-with-the-same-action)<br />
    * [Service with disposable resources](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#service-with-disposable-resources)<br />
    * [Forked service](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#forked-service)<br />
* Tasks
    * [Task](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#task)<br />
    * [Recurring task](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#recurring-task)<br />
* Other
    * [Serializer](https://github.com/discord-mix/mix/blob/dev-2.0/EXAMPLES.MD#serializer)<br />

#### Additional Notes

Mix is intended for both serious, large scale and simple, elegant bot development, however it may not be suitable for everyone.

If such is the case, it may be worth considering the following fine alternatives:

📦 [Klasa](https://github.com/dirigeants/klasa) by [Dirigeants](https://github.com/dirigeants)<br />
📦 [Commando](https://github.com/discordjs/Commando) by [discordjs](https://github.com/discordjs)<br />
📦 [yamdbf core](https://github.com/yamdbf/core) by [yamdbf team](https://github.com/yamdbf)<br />
