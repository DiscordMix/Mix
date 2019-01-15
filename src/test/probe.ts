import Probe from "../probe/probe";
import {Unit, Test} from "../decorators/test";

@Unit()
export class MyUnit {
    @Test("should do nothing")
    public myTest(): void {
        //
    }
}

Probe.run();
