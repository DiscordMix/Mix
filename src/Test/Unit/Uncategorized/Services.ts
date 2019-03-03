import {unit, test, Assert, Is} from "unit";
import {testBot} from "../TestBot";
import TestUtils, {ExcludeParam} from "../TestUtils";

@unit("Services")
default class {
    @test("should register services")
    public register() {
        Assert.true(testBot.services.contains("test"));

        for (const item of TestUtils.makeParams(["test"])) {
            Assert.false(testBot.services.contains(item));
        }

        Assert.equal(testBot.services.getAll().size, 3);
    }

    @test("should not register invalid services")
    public notRegisterInvalid() {
        for (const param of TestUtils.makeParams([ExcludeParam.Object])) {
            Assert.false(testBot.services.register(param));
        }
    }

    @test("should not enable invalid services")
    public async notEnableInvalid() {
        // TODO: Append another string that is not 'test'.
        for (const param of TestUtils.makeParams(["test"])) {
            Assert.false(await testBot.services.start(param));
        }
    }

    @test("should be able to retrieve services")
    public retrieve() {
        Assert.that(testBot.services.getService("test"), Is.object);
    }

    @test("should not be able to retrieve invalid services")
    public notRetrieveInvalid() {
        // TODO: Append another string that is not 'test'.
        for (const param of TestUtils.makeParams(["test"])) {
            Assert.that(testBot.services.getService(param), Is.null);
        }
    }
}
