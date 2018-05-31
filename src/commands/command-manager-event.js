/**
 * @enum {Number}
 */
const CommandManagerEvent = {
    DisallowedEnvironment: 0,
    DisabledCommand: 1,
    ArgumentAmountMismatch: 2,
    CommandMayNotExecute: 3,
    InvalidArguments: 4,
    RequiresPermissions: 5,
    CommandError: 6
};

export default CommandManagerEvent;
