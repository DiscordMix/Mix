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

export default class DataCollector {
    private readonly guild: Guild;

    private collectType: MemberDataType;
    private fromType: MemberType;
    private whereCondition?: (member: GuildMember) => boolean;

    constructor(guild: Guild) {
        this.guild = guild;
        this.collectType = MemberDataType.Everything;
        this.fromType = MemberType.Everyone;
    }

    collect(dataType: MemberDataType): DataCollector {
        // TODO

        return this;
    }

    from(memberType: MemberType): DataCollector {
        this.fromType = memberType;

        return this;
    }

    where(condition: (member: GuildMember) => boolean): DataCollector {
        this.whereCondition = condition;

        return this;
    }

    finish(): Array<GuildMember> {
        const members = this.guild.members.array();

        let result: Array<GuildMember> = [];

        for (let i = 0; i < members.length; i++) {
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

        if (this.collectType !== MemberDataType.Everything) {
            result.map((member) => {
                // TODO: Checks should be outside for better performance
                switch (this.collectType) {
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
                }
            });
        }

        return result;
    }
}
