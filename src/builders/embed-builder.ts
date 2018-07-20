import {RichEmbed} from "discord.js";
import Discord from "discord.js";

export default class EmbedBuilder {
    private readonly embed: RichEmbed;

    constructor() {
        /**
         * @type {Discord.RichEmbed}
         * @private
         * @readonly
         */
        this.embed = new Discord.RichEmbed();
    }

    /**
     * Set the color of the embed
     * @param {string} color
     * @return {EmbedBuilder}
     */
    color(color: string): EmbedBuilder {
        this.embed.setColor(color);

        return this;
    }

    /**
     * Set the title of the embed
     * @param {string} title
     * @return {EmbedBuilder}
     */
    title(title: string): EmbedBuilder {
        this.embed.setAuthor(title, this.embed.author ? this.embed.author.icon_url : "");

        return this;
    }

    /**
     * @param {string} url
     * @return {EmbedBuilder}
     */
    titleIcon(url: string): EmbedBuilder {
        this.embed.setAuthor(this.embed.author ? this.embed.author.name : null, url);

        return this;
    }

    /**
     * Set the thumbnail image of the embed
     * @param {string} url
     * @return {EmbedBuilder}
     */
    thumbnail(url: string): EmbedBuilder {
        this.embed.setThumbnail(url);

        return this;
    }

    /**
     * Set the footer text of the embed
     * @param {string} text
     * @param {string} icon
     * @return {EmbedBuilder}
     */
    footer(text: string, icon: string): EmbedBuilder {
        this.embed.setFooter(text, icon);

        return this;
    }

    /**
     * Set the image of the embed
     * @param {string} url
     * @return {EmbedBuilder}
     */
    image(url: string): EmbedBuilder {
        this.embed.setImage(url);

        return this;
    }

    /**
     * Set the text of the embed
     * @todo Limit text to Discord's embed char limit
     * @param {string} text
     * @return {EmbedBuilder}
     */
    text(text: string): EmbedBuilder {
        this.embed.setDescription(text);

        return this;
    }

    /**
     * Add a field to the embed
     * @param {string} title
     * @param {*} value
     * @return {EmbedBuilder}
     */
    field(title: string, value: any): EmbedBuilder {
        this.embed.addField(title, value);

        return this;
    }

    /**
     * Convert the embed to a RichEmbed
     * @return {Discord.RichEmbed}
     */
    build(): RichEmbed {
        return this.embed;
    }

    /**
     * @param {Object} obj
     * @return {EmbedBuilder}
     */
    static fromObject(obj: any): EmbedBuilder {
        const result = new EmbedBuilder();

        if (!obj.text) {
            throw new Error("[EmbedBuilder.fromObject] Text cannot be empty or null");
        }
        else {
            result.text(obj.text);
        }

        if (obj.image) {
            result.image(obj.image);
        }

        if (obj.color) {
            result.color(obj.color);
        }

        if (obj.title) {
            result.title(obj.title);
        }

        if (obj.titleIcon) {
            result.titleIcon(obj.titleIcon);
        }

        if (obj.footer) {
            result.footer(obj.footer.text, obj.footer.icon);
        }

        if (obj.thumbnail) {
            result.thumbnail(obj.thumbnail);
        }

        return result;
    }

    /**
     * @param {Object} sections
     * @param {string} color
     * @return {EmbedBuilder}
     */
    static sections(sections: any, color: string = ""): EmbedBuilder {
        const result = new EmbedBuilder();

        for (let i = 0; i < Object.keys(sections).length; i++) {
            result.field(Object.keys(sections)[i], sections[Object.keys(sections)[i]]);
        }

        if (color) {
            result.color(color);
        }

        return result;
    }
}
