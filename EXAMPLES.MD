### Command

```ts
import {Command, CommandContext, IFragmentMeta} from "@cloudrex/forge";

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

### Command with arguments

```ts
import {Command, CommandContext, IFragmentMeta, IArgument, TrivialArgType} from "@cloudrex/forge";

interface IMyCommandArgs {
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

### Service

```ts
import {Service, Log, IFragmentMeta} from "@cloudrex/forge";

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

### Service with event handling

```ts
import {Service, Log, IFragmentMeta, DiscordEvent} from "@cloudrex/forge";
import {Message} from "dicord.js";

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

### Service handling multiple events with the same action

```ts
import {Service, Log, IFragmentMeta, DiscordEvent} from "@cloudrex/forge";
import {Message} from "dicord.js";

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

### Service with disposable resources

```ts
import {Service, Log, IFragmentMeta, DiscordEvent} from "@cloudrex/forge";
import {Message} from "discord.js";

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

### Forked service

```ts
import {ForkedService, Log, IFragmentMeta} from "@cloudrex/forge";

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

### Task

```ts
import {Task, Log} from "@cloudrex/forge";

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

### Recurring task

```ts
import {Task, Log} from "@cloudrex/forge";

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

### Serializer

```ts
import {ISerializer} from "@cloudrex/forge";

interface IHelloObject {
    readonly message: string;
}

/**
 * Would serialize:
 * 
 * hello world => { message: "world" }
 * { message: "world" } => "hello world"
 */
export default class HelloSerializer extends ISerializer<IHelloObject> {
    public serialize(data: IHelloObject): string | null {
        return `hello ${data.message}`;
    }

    public deserialize(serializedData: string): IHelloObject | null {
        return {
            message: serializedData.split("hello ")[1]
        };
    }
}
```