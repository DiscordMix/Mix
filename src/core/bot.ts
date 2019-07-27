import Router from "./router";
import {Client} from "discord.js";

export default class Bot extends Router {
    public readonly client: Client;

    public constructor() {
        super();

        this.client = new Client();
    }
}
