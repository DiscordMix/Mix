## Introduction
#### What
This file is intended to give you an in-depth guide to understanding and working with Tux.

Here's some basic stuff you should know about Tux:

* Should be used with [Node.js](https://nodejs.org/en/) **v8.11** (Please refrain from using v9.11).
* Is built using [ECMAScript 6](http://es6-features.org/#Constants) with the [Babel](https://babeljs.io/) transpiler (transpilation required).
* Uses the Discord.js library ([click here](https://discord.js.org/#/docs/main/stable/general/welcome) to view the documentation).
* Uses a database (will get into detail later).
* Is object oriented (most code is based on classes).
* Trigger = command prefix.
* Has a setup script (setup your token, trigger, etc.).
* Is a penguin (yes, it's important to know).

#### Why
Here's some questions you might have asked yourself and their reasons:

* **Why use Discord.js?** Because it's the most popular JavaScript library for writing Discord bots and JavaScript is *bae*.
* **Why use a database?** Because storing huge data in a JSON file is savage.
* **Why use [sqlite](https://en.wikipedia.org/wiki/SQLite)?** Because it's portable and convenient (no need for processes, etc.).
* **Why not use [RethinkDB](https://www.rethinkdb.com/)?** Because it's way too complicated to setup compared to the current system, and requires a background process.

## Naming
Yes there is a whole section for naming files and variables.

#### Files
* All files should be lower-case and be separated by dashes (-). Ex. `my-file.js`.

#### Commands
* Command files should be named with the base name of the command, and
not any of its aliases.

## Commands
In Tux, commands are meant to be self-contained. They should be able
to function without accessing `global` or outside methods other than
those provided by the `Context` (explained below).

#### Creation
Every command gets its own file. Every command should contain the following
methods:

* `exected(context)` : When the command is executed
* `canExecute(context)` : Determines whether the command can be executed

Apart from that, they should also contain the `meta` property.

Below is a working example for the command `name.js` (Ignore properties that do not have annotations, as they will be explained later):

```javascript
export default {
	executed(context) {
		context.respond("Hello World!");
	},
	
	canExecute(context) {
		return true;
	},
	
	meta: {
		name: "hello", // The name of our command
		description: "Responds with hello world", // A brief description of our command
		accessLevel: AccessLevelType.Guest,
		aliases: [], // Aliases of our command (strings)
		maxArguments: 0, // The total amount of possible arguments that our command can take
		args: {},
		category: CommandCategoryType.Fun, // The category of our command
		enabled: true, // Whether our command is enabled
		price: 0
	}
};
````

#### Command Execution Context
When a command is executed, it will receive the `CommandExecutionContext` object as the first and only argument.
Take a look at the `CommandExecutionContext` class's constructor:

```javascript
class CommandExecutionContext {
	constructor(message, args, bot, accessLevel) {
		this.message = message;
		this.arguments = args;
		this.bot = bot;
		this.accessLevel = accessLevel;
	}
	
	...
}
```

Passing the `CommandExecutionContext` argument allows every command to access
every part of Tux.

*... to be continued*

#### Execution
*... to be continued*

## Database
Tux uses the [sqlite](https://en.wikipedia.org/wiki/SQLite) database system and the [knex.js](http://knexjs.org/) JavaScript library to access the database.

To "manually" edit/view the database structure and records, I recommend you use the free software [sqlitebrowser](http://sqlitebrowser.org/).

Some notes about database communication:

* Most (probably all) of the code used to communicate with the database is located in the `database.js` file under the `src/database/` directory.
* All database methods are async.

#### Database Models
Don't let the name scare you, it's just a name. Database models are basically a "model" of the database tables (they are actually just classes). Let me elaborate:

Let's say we have a table called `users` (which we actually do) and that table has the columns/properties: `id`, `name`, and `age`.
In this case, we would create a database model as follows:

```javascript
class dbUser {
    constructor(id, name, age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
}
```

That's it! We now have our "model" or class for the `users` table called `dbUser` (always use the `db` prefix when naming models to distinguish between database models and other classes).

You might be asking yourself: "Why do you use database models?" Database models actually make communication with the database easier, which I will later explain why.

You may think of a database model as a local database row or placeholder row of a certain table.

Now that we have our model, with a little more setup, whenever we query a row from the database we can expect that when we use a database method (for example `getUserById()`) it will return an *instance* of our `dbUser` model.

Let's say we have the following data in our `users` table:

| id                 | name     | age |
|--------------------|----------|-----|
| 285578743324606482 | John Doe | 21  |

We could then do this (somewhat-pseudo-code):

```javascript
// example id provided, returns instance of dbUser
const theDankUser = await database.getUserById("285578743324606482");

theDankUser.id; // 285578743324606482
theDankUser.name; // John Doe
theDankUser.age; // 21
```

See how database models help now? Now it's time to dive a little deeper.

Since we're using the knex.js library to access the database, querying
returns plain objects. We want to have results to be able to be converted
to database models. To do this, we manually implement the `fromResult` method
to all our database models.

This is how our `dbUser` model would look:

```javascript
class dbUser {
	...
	
	static fromResult(queryResult) {
		return new DbUser(
			queryResult.id,
			queryResult.name,
			queryResult.age
		);
	}
}
```

This method will be then used by our database methods to return
queries in the form of database models.

*... to be continued!*

## Events
Tux implements a custom events hub.

#### Event List
* `commandWillExecute` - Before a command will execute.
* `commandExecuted` - Once a command has been successfully executed.
* `userConfigModified` - Once the `user-config.json` file has been modified. **(Not yet implemented)**
* `botConnecting` - Before the bot connects to Discord. **(Not yet implemented)**
* `botDisconnecting` - Before the bot disconnects from Discord. **(Not yet implemented)**