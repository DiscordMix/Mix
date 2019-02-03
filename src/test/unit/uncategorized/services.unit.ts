import {Unit, Test, Assert, Is} from "unit";
import {testBot} from "../test-bot";
import TestUtils, {ExcludeParam} from "../../test-utils";

@Unit("Services")
default class {
    @Test("should register services")
    public register() {
        Assert.true(testBot.services.contains("test"));

        for (const item of TestUtils.makeParams(["test"])) {
            Assert.false(testBot.services.contains(item));
        }

        Assert.equal(testBot.services.getAll().size, 3);
    }

    @Test("should not register invalid services")
    public notRegisterInvalid() {
        for (const param of TestUtils.makeParams([ExcludeParam.Object])) {
            Assert.false(testBot.services.register(param));
        }
    }

    @Test("should not enable invalid services")
    public async notEnableInvalid() {
        // TODO: Append another string that is not 'test'.
        for (const param of TestUtils.makeParams(["test"])) {
            Assert.false(await testBot.services.start(param));
        }
    }

    @Test("should be able to retrieve services")
    public retrieve() {
        Assert.that(testBot.services.getService("test"), Is.object);
    }

    @Test("should not be able to retrieve invalid services")
    public notRetrieveInvalid() {
        // TODO: Append another string that is not 'test'.
        for (const param of TestUtils.makeParams(["test"])) {
            Assert.that(testBot.services.getService(param), Is.null);
        }
    }
}
