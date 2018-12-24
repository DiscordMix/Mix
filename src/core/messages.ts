enum BotMessages {
    SETUP_INVALID = "[Bot] Missing or invalid settings options",
    SETUP_FAIL_LOAD_FRAGMENTS = "[Bot.setup] Failed to load internal fragments",
    SETUP_NO_FRAGMENTS_DETECTED = "[Bot.setup] No internal fragments were detected",
    SETUP_NO_FRAGMENTS_LOADED = "[Bot.setup] No internal fragments were loaded",
    SETUP_NO_FRAGMENTS_ENABLED = "[Bot.setup] No internal fragments were enabled",
    SETUP_NO_SERVICES_LOADED = "[Bot.setup] No services were loaded",
    SETUP_NO_COMMANDS_LOADED = "[Bot.setup] No commands were loaded",
    SETUP_NO_COMMANDS_ENABLED = "[Bot.setup] No commands were enabled",
    SETUP_LOADING_TASKS = "[Bot.setup] Loading tasks",
    SETUP_NO_TASKS_TRIGGERED = "[Bot.setup] No tasks were triggered",
    SETUP_NO_TASKS_FOUND = "[Bot.setup] No tasks found",
    SETUP_START_OPTIMIZER = "[Bot.setup] Starting optimization engine",
    SETUP_STARTED_OPTIMIZER = "[Bot.setup] Started optimization engine",
    SETUP_COMPLETED = "[Bot.setup] Bot setup completed",
    
    TEST_EXPECT_TOKEN = "[Tests] Expecting test token",
    TEST_EXPECT_GUILD = "[Tests] Expecting test guild's ID",
    TEST_EXPECT_CHANNEL = "[Tests] Expecting test guild's channel",
    TEST_CHANNEL_NOT_TEXT = "[Tests] Test channel is not a text channel",
    TEST_CHANNEL_NO_EXIST = "Test guild does not have test channel",
    TEST_NO_GUILD = "Bot is not in the test guild",

    CONTEXT_EXPECT_TEXT_CHANNEL = "[CommandContext] Expecting message's channel to be a text channel",

    LANG_NO_DEFAULT = "[Language.get] No language source has been set as default",
    LANG_NO_BASE_DIR = "[Language.load] No base directory has been specified",
    LANG_BASE_DIR_NO_EXIST = "[Language.load] Base directory no longer exists",

    CFG_EXPECT_GENERAL = "[Settings] Expecting general settings",
    CFG_FILE_NO_EXIST = "[Settings.fromFile] Could not load settings: File does not exist",

    STORE_EXPECT_HANDLER_FUNC = "[Store.subscribe] Expecting handler to be a function",
    STORE_INVALID_ACTION = "[Store] Expecting action parameter to be either an action object or an action type",
    STORE_EXPECT_REDUCER_FUNC = "[Store] Expecting reducer to be a function",
    STORE_REDUCER_NO_UNDEFINED = "[Store] Reducer must return a state, otherwise return null to indicate no changes",

    INTENTIONAL_ERROR = "Intentionally thrown error"
}

export default BotMessages;