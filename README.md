[![Build Status](https://travis-ci.com/discord-forge/forge.svg?branch=dev-2.0)](https://travis-ci.com/discord-forge/forge?branch=dev-2.0)
[![NPM Package](https://badge.fury.io/js/%40cloudrex%2Fforge.svg)](https://www.npmjs.com/package/@cloudrex/forge)

Forge is a powerful, fully-modular and self-contained Discord bot framework for serious bot development.

**Note**: Forge is a library to create bots and not a Discord API library.

#### Useful Links
=> [View the NPM package](https://www.npmjs.com/package/@cloudrex/forge)

=> [View the documentation](https://cloudrex.gitbook.io/forge/) (**Still being written**)

=> [View CLI tool on NPM](https://www.npmjs.com/package/@cloudrex/forge-cli)

=> [Example bot](https://github.com/discord-forge/example-forge-bot)

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

#### Helpful Snippets

Command

```ts
import {Command, CommandContext, IFragmentMeta} from "@cloudrex/forge"

export default class MyCommand extends Command {
    readonly meta: IFragmentMeta = {
        name: "mycommand",
        description: "Responds with hello world"
    };

    public run(x: CommandContext): Promise<void> {
        await x.ok("Hello world");
    }
}
```

Command with arguments

```ts
import {Command, CommandContext, IFragmentMeta, IArgument, TrivialArgType} from "@cloudrex/forge"

type IMyCommandArgs = {
    readonly message: string;
}

export default class MyCommand extends Command<IMyCommandArgs> {
    readonly meta: IFragmentMeta = {
        name: "mycommand",
        description: "Responds with hello world"
    };

    readonly arguments: IArgument[] = [
        {
            name: "message",
            description: "The message to say",
            required: true,
            type: TrivialArgType.String
        }
    ];

    public run(x: CommandContext, args: IMyCommandArgs): Promise<void> {
        await x.ok(args.message);
    }
}
```

Service

```ts
import {Service, Log, IFragmentMeta} from "@cloudrex/forge"

export default class MyService extends Service {
    readonly meta: IFragmentMeta = {
        name: "myservice",
        description: "A template service"
    };

    public start(): void {
        Log.success("MyService started");
    }
}
```

Service with event handling

```ts
import {Service, Log, IFragmentMeta, DiscordEvent} from "@cloudrex/forge"
import {Message} from "dicord.js"

export default class MyService extends Service {
    readonly meta: IFragmentMeta = {
        name: "myservice",
        description: "A template service"
    };

    public start(): void {
        Log.success("MyService started");

        this.on(DiscordEvent.Message, (msg: Message) => {
            Log.info(`MyService received a message from ${msg.author.tag}`);
        });
    }
}
```

Service handling multiple events with the same action

```ts
import {Service, Log, IFragmentMeta, DiscordEvent} from "@cloudrex/forge"
import {Message} from "dicord.js"

export default class MyService extends Service {
    readonly meta: IFragmentMeta = {
        name: "myservice",
        description: "A template service"
    };

    public start(): void {
        Log.success("MyService started");

        this.on(DiscordEvent.Message, this.doSomething.bind(this));
        this.on(DiscordEvent.MessageUpdated, this.doSomething.bind(this));
        this.on(DiscordEvent.MessageDeleted, this.doSomething.bind(this));
    }

    private doSomething(): void {
        Log.info("An event being tracked has occurred");
    }
}
```

Service with disposable resources

```ts
import {Service, Log, IFragmentMeta, DiscordEvent} from "@cloudrex/forge"
import {Message} from "discord.js"

export default class MyService extends Service {
    readonly meta: IFragmentMeta = {
        name: "myservice",
        description: "A template service"
    };

    private static messageMemory: Message[] = [];

    public start(): void {
        // Save sent messages
        this.on(DiscordEvent.Message, (msg: Message) => {
            MyService.messageMemory.push(msg);
        });
    }

    // Dispose resources upon being stopped
    public dispose(): void {
        MyService.messageMemory = [];
    }
}
```

Forked service

```ts
import {ForkedService, Log, IFragmentMeta} from "@cloudrex/forge"

export default class MyService extends ForkedService {
    readonly meta: IFragmentMeta = {
        name: "myforkedservice",
        description: "A template forked service"
    };

    public start(): void {
        // Code here
    }

    public onMessage(msg: IProcessMsg, sender: any): IProcessMsg[] | IProcessMsg | void {
        // Code on message from parent here
    }
}
```

Task

```ts
import {Task, Log} from "@cloudrex/forge"

export default class MyTask extends Task {
    readonly meta: IFragmentMeta = {
        name: "mytask",
        description: "A template task"
    };

    public run(): void {
        Log.success("MyTask has been executed");
    }
}
```

Recurring task

```ts
import {Task, Log} from "@cloudrex/forge"

export default class MyRecurringTask extends Task {
    readonly meta: IFragmentMeta = {
        name: "myrecurringtask",
        description: "A template recurring task"
    };

    readonly interval: number = 10 * 1000; // Run every 10 seconds

    public run(): void {
        Log.success("MyRecurringTask has been executed");
    }
}
```

Serializer

```ts
import {ISerializer} from "@cloudrex/forge"

type IHelloObject = {
    readonly message: string;
}

export default class HelloSerializer extends ISerializer<IHelloObject> {
    public serialize(data: IHelloObject): string | null {
        return data.message;
    }

    public deserialize(serializedData: string): IHelloObject | null {
        return {
            message: serializedData.split("hello ")[1]
        };
    }
}
```