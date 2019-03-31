import {testBot} from "./testBot";
import {Mock} from "unit";

/**
 * TODO: Should not be overwriting the disconnect() function, it should be instead client.destroy().
 * Find a way to prevent disconnect() from initializing a new Client which overrides mocking.
 * With the disconnect() function being overwriten, the disconnect()'s tests become nearly redundant.
 */
// Mock the disconnect() bot method to prevent creating a new client thus invalidating mocking of login().
testBot.disconnect = Mock.fn(testBot.disconnect)
    // Should return the bot instance (used elsewhere).
    .returnAlways(new Promise((r) => r(testBot)))

    .proxy;

// Mock the login() Discord.JS client method.
testBot.client.login = Mock.fn(testBot.client.login)
    // Should return the bot instance (used elsewhere).
    .returnOnce(new Promise((r) => r(testBot)))

    .proxy;
