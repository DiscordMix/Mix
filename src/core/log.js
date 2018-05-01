const colors = require("colors");
const fs = require("fs");

export default class Log {
  /**
   * @param {Bot} bot
   * @param {Boolean} debug
   * @param {Boolean} verbose
   */
  constructor(bot, debug = false, verbose = false) {
    /**
     * @type {Bot}
     * @private
     */
    this.bot = bot;
    this.debug_mode = debug;
    this.verbose_mode = verbose;
    Log.instance = this;
  }

  log(message, color = "white", prefix = null, throwMsg = false) {
      Log.log(message, color, prefix, throwMsg);
  }

  info(message) {
      this.log(message, "cyan", "info");
  }

  success(message) {
      this.log(message, "green", "sucs");
  }

  warn(message) {
      this.log(message, "yellow", "warn");
  }

  error(message) {
      this.log(message, "red", "dang");
  }

  verbose(message) {
      if (this.verbose_mode) {
          this.log(message, "gray");
      }
  }

  debug(message) {
      if (this.debug_mode) {
          this.log(message, "magenta", "dbug");
      }
  }

  channel(content, options) {
      const guildLog = this.bot.dataAdapter.get("global.guild-log");
      if (!guildLog.enabled) {
          return;
      }

      this.bot.client.guilds.get(guildLog.guild).channels.get(guildLog.channel).send(content, options);
  }

  /**
   * @param {String} message
   * @param {String} color
   * @param {String} prefix
   */
  static async log(message, color = "white", prefix = null) {
      const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

      // TODO: Make this next line work on the vps
      // process.stdout.write(`\x1B[2D[${date}] ${colors[color](message)}\n> `);
      console.log(`[${date}] ${colors[color](message)}`);

      if (prefix !== null) {
          message = `<${prefix.toUpperCase()}> ${message}`;
      }
      fs.writeFile("bot.log", `[${date}] ${message}\n`, { flag: "a" }, (err) => {
          if (err) throw err;
      });
  }

  /**
   * @param {String} message
   */
  static info(message) {
      Log.log(message, "cyan", "info");
  }

  /**
   * @param {String} message
   */
  static success(message) {
      Log.log(message, "green", "sucs");
  }

  /**
   * @param {String} message
   */
  static warn(message) {
      Log.log(message, "yellow", "warn");
  }

  /**
   * @param {String} message
   */
  static error(message) {
      Log.log(message, "red", "dang");
  }

  /**
   * @param {String} message
   */
  static verbose(message) {
      if (Log.instance !== null) {
          if (Log.instance.verbose_mode) {
              Log.log(message, "grey");
          }
      } else {
          Log.log(message, "grey");
      }
  }

  /**
   * @param {String} message
   */
  static debug(message) {
      if (Log.instance !== null) {
          if (Log.instance.debug_mode) {
              Log.log(message, "magenta", "dbug");
          }
      } else {
          Log.log(message, "magenta", "dbug");
      }
  }
}
