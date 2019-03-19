import Discord, {RichEmbed} from "discord.js";
import Builder from "./builder";
import Log from "../core/log";

export interface IEmbedBuilder extends Builder<RichEmbed> {
    color(color: string): this;
    title(title: string): this;
    titleIcon(url: string): this;
    thumbnail(url: string): this;
    footer(text: string, icon?: string): this;
    image(url: string): this;
    text(text: string): this;
    field(title: string, value: string): this;
}

export default class EmbedBuilder extends Builder implements IEmbedBuilder {
    public static fromObject(obj: any): EmbedBuilder {
        const result = new EmbedBuilder();

        if (!obj.text) {
            throw Log.error("Text cannot be empty or null");
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

    public static sections(sections: any, color: string = ""): EmbedBuilder {
        const result = new EmbedBuilder();

        for (const section of Object.keys(sections)) {
            result.field(section, sections[section]);
        }

        if (color) {
            result.color(color);
        }

        return result;
    }

    protected readonly embed: RichEmbed;

    public constructor() {
        super();

        this.embed = new Discord.RichEmbed();
    }

    /**
     * Set the color of the embed.
     */
    public color(color: string): this {
        this.embed.setColor(color);

        return this;
    }

    /**
     * Set the title of the embed.
     */
    public title(title: string): this {
        this.embed.setAuthor(title, this.embed.author ? this.embed.author.icon_url : "");

        return this;
    }

    public titleIcon(url: string): this {
        this.embed.setAuthor(this.embed.author ? this.embed.author.name : null, url);

        return this;
    }

    /**
     * Set the thumbnail image of the embed.
     */
    public thumbnail(url: string): this {
        this.embed.setThumbnail(url);

        return this;
    }

    /**
     * Set the footer text of the embed.
     */
    public footer(text: string, icon?: string): this {
        this.embed.setFooter(text.substr(0, 2048), icon);

        return this;
    }

    /**
     * Set the image of the embed.
     */
    public image(url: string): this {
        this.embed.setImage(url);

        return this;
    }

    // TODO: Limit text to Discord's embed char limit (done, needs testing).
    /**
     * Set the text of the embed.
     */
    public text(text: string): this {
        this.embed.setDescription(text.substr(0, 1024));

        return this;
    }

    /**
     * Add a field to the embed.
     */
    public field(title: string, value: string): this {
        this.embed.addField(title.substr(0, 256), value.substr(0, 1024));

        return this;
    }

    /**
     * Convert the embed to a RichEmbed.
     */
    public build(): RichEmbed {
        return this.embed;
    }
}
