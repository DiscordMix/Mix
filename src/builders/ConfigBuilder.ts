import {IBuilder} from "./Builder";

namespace Builders {
    export interface IConfigBuilder extends IBuilder<object> {
        commandsPath(path: string): this;
        settingsPath(path: string): this;
        argumentTypes(argumentTypes: object): this;
    }

    export class ConfigBuilder implements IConfigBuilder {
        protected readonly properties: any;

        public constructor() {
            this.properties = [];
        }

        public commandsPath(path: string): this {
            this.properties.paths.commandStore = path;

            return this;
        }

        public settingsPath(path: string): this {
            this.properties.paths.settings = path;

            return this;
        }

        public argumentTypes(argumentTypes: object): this {
            this.properties.argumentTypes = argumentTypes;

            return this;
        }

        public build(): object {
            return this.properties;
        }
    }
}
