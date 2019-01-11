import Discord, {RichEmbed} from "discord.js";
import {IBuilder} from "..";

export interface IEmbedBuilder extends IBuilder<RichEmbed> {
    color(color: string): this;
    title(title: string): this;
    titleIcon(url: string): this;
    thumbnail(url: string): this;
    footer(text: string, icon?: string): this;
    image(url: string): this;
    text(text: string): this;
    field(title: string, value: string): this;
}

export default class EmbedBuilder implements IEmbedBuilder {
    /**
     * @param {Object} obj
     * @return {EmbedBuilder}
     */
    public static fromObject(obj: any): EmbedBuilder {
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
     * @param {*} sections
     * @param {string} color
     * @return {EmbedBuilder}
     */
    public static sections(sections: any, color: string = ""): EmbedBuilder {
        const result = new EmbedBuilder();

        for (let i: number = 0; i < Object.keys(sections).length; i++) {
            // TODO: Invoking Object.keys() again
            result.field(Object.keys(sections)[i], sections[Object.keys(sections)[i]]);
        }

        if (color) {
            result.color(color);
        }

        return result;
    }

    protected readonly embed: RichEmbed;

    public constructor() {
        /**
         * @type {Discord.RichEmbed}
         * @protected
         * @readonly
         */
        this.embed = new Discord.RichEmbed();
    }

    /**
     * Set the color of the embed
     * @param {string} color
     * @return {this}
     */
    public color(color: string): this {
        this.embed.setColor(color);

        return this;
    }

    /**
     * Set the title of the embed
     * @param {string} title
     * @return {this}
     */
    public title(title: string): this {
        this.embed.setAuthor(title, this.embed.author ? this.embed.author.icon_url : "");

        return this;
    }

    /**
     * @param {string} url
     * @return {this}
     */
    public titleIcon(url: string): this {
        this.embed.setAuthor(this.embed.author ? this.embed.author.name : null, url);

        return this;
    }

    /**
     * Set the thumbnail image of the embed
     * @param {string} url
     * @return {this}
     */
    public thumbnail(url: string): this {
        this.embed.setThumbnail(url);

        return this;
    }

    /**
     * Set the footer text of the embed
     * @param {string} text
     * @param {string} icon
     * @return {this}
     */
    public footer(text: string, icon?: string): this {
        this.embed.setFooter(text.substr(0, 2048), icon);

        return this;
    }

    /**
     * Set the image of the embed
     * @param {string} url
     * @return {this}
     */
    public image(url: string): this {
        this.embed.setImage(url);

        return this;
    }

    /**
     * Set the text of the embed
     * @todo Limit text to Discord's embed char limit (done, needs testing)
     * @param {string} text
     * @return {this}
     */
    public text(text: string): this {
        this.embed.setDescription(text.substr(0, 1024));

        return this;
    }

    /**
     * Add a field to the embed
     * @param {string} title
     * @param {string} value
     * @return {this}
     */
    public field(title: string, value: string): this {
        this.embed.addField(title.substr(0, 256), value.substr(0, 1024));

        return this;
    }

    /**
     * Convert the embed to a RichEmbed
     * @return {Discord.RichEmbed}
     */
    public build(): RichEmbed {
        return this.embed;
    }
}
