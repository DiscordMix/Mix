[![Build Status](https://travis-ci.com/discord-forge/forge.svg?branch=dev-2.0)](https://travis-ci.com/discord-forge/forge?branch=dev-2.0)
[![NPM Package](https://badge.fury.io/js/%40cloudrex%2Fforge.svg)](https://www.npmjs.com/package/@cloudrex/forge)

Forge is a powerful, fully-modular and self-contained Discord bot framework for serious bot development.

**Note**: Forge is a library to create bots and not a Discord API library.

=> [View the NPM package](https://www.npmjs.com/package/@cloudrex/forge)

=> [View the documentation](https://cloudrex.gitbook.io/forge/) (**Still being written**)

=> [View CLI tool on NPM](https://www.npmjs.com/package/@cloudrex/forge-cli)

#### Quick Start with the CLI tool (recommended)

Get started quickly with your next Discord bot project by using our CLI tool!

To install and create a template bot in seconds issue the following commands:

`$ npm install --global @cloudrex/forge-cli`

`$ forge new bot`

`$ cd bot`

A bot boilerplate will be created under the `bot` directory.

You may then install required NPM modules (`npm install`) and run `npm run config` to configure your bot.

Then just start the bot using `$ npm start`

That's it! You should be presented with the fancy Forge title and you're ready to get started building your next masterpiece.

#### Installing

To incorporate Forge into an existing project, simply issue the following command:

`$ npm install --save @cloudrex/forge`

Then you can simply require Forge's classes:

```ts
import {Bot, Utils, GenericCollection} from "@cloudrex/forge"
```

#### Building

To build the project, use `npm run build` or `yarn build` if using the [Yarn](https://yarnpkg.com/) package manager.

Make sure that you have installed the project dependencies (`npm install` or `yarn`).

#### Contributing

Thanks for your interest in helping in the project. To contribute to this project, you will be required to use pull requests.

#### Versioning

When contributing, please follow the [Semantic Versioning](https://semver.org/) guidelines.
