import {Guild, GuildMember} from "discord.js";

export enum MemberDataType {
    Username,
    Status,
    State,
    Avatar,
    Nickname,
    Roles,
    Everything
}

export enum MemberType {
    User,
    Bot,
    Everyone
}

// TODO: Should also be able to call a callback function every X iterations
export default class DataCollector {
    private readonly guild: Guild;
    private readonly collectionType: MemberDataType;

    private fromType: MemberType;
    private whereCondition?: (member: GuildMember) => boolean;

    /**
     * @param {Guild} guild
     */
    public constructor(guild: Guild) {
        /**
         * @type {Guild}
         * @private
         * @readonly
         */
        this.guild = guild;

        /**
         * @type {MemberDataType}
         * @private
         */
        this.collectionType = MemberDataType.Everything;

        /**
         * @type {MemberType}
         * @private
         */
        this.fromType = MemberType.Everyone;
    }

    /**
     * @param {MemberDataType} dataType
     * @return {this}
     */
    public collect(dataType: MemberDataType): this {
        // TODO:

        return this;
    }

    /**
     * @param {MemberType} memberType
     * @return {this}
     */
    public from(memberType: MemberType): this {
        this.fromType = memberType;

        return this;
    }

    /**
     * @param {(GuildMember) => boolean} condition
     * @return {this}
     */
    public where(condition: (member: GuildMember) => boolean): this {
        this.whereCondition = condition;

        return this;
    }

    /**
     * @return {GuildMember[]}
     */
    public finish(): GuildMember[] {
        const members: GuildMember[] = this.guild.members.array();

        let result: GuildMember[] = [];

        for (let i: number = 0; i < members.length; i++) {
            if (this.fromType === MemberType.User && members[i].user.bot) {
                continue;
            }
            else if (this.fromType === MemberType.Bot && !members[i].user.bot) {
                continue;
            }

            result.push(members[i]);
        }

        if (this.whereCondition) {
            result.filter(this.whereCondition);
        }

        if (this.collectionType !== MemberDataType.Everything) {
            result.map((member) => {
                // TODO: Checks should be outside for better performance
                switch (this.collectionType) {
                    case MemberDataType.Avatar: {
                        return member.user.avatarURL;
                    }

                    case MemberDataType.Nickname: {
                        return member.nickname;
                    }

                    case MemberDataType.Roles: {
                        return member.roles;
                    }

                    case MemberDataType.State: {
                        return member.user.presence.status;
                    }

                    case MemberDataType.Status: {
                        return member.user.presence.game;
                    }

                    default: {
                        throw new Error(`[DataCollector.finish] Invalid collection type: ${this.collectionType}`);
                    }
                }
            });
        }

        return result;
    }
}
