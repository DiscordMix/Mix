// TODO: Migrate badges into JSON and make a class for it
const BadgeType = {
	EmptyInventory: 0,
	ApprenticeScripter: 1,
	IntermediateScripter: 2,
	ExperiencedScripter: 3,
	MasterScripter: 4,
	TrueFan: 5,
	TuxX: 6,
	NotSoSecret: 7,
	JunkHunter: 8,
	LooterWannabe: 9,
	ActualLooter: 10,
	CrateAddict: 11,
	Human: 12,
	BeepBoop: 13,
	Commander: 14,
	Mastermind: 15,
	UninvitedDev: 16,

	/**
	 * @returns {array<BadgeType>}
	 */
	getAll() {
		return [
			BadgeType.EmptyInventory,
			BadgeType.ApprenticeScripter,
			BadgeType.IntermediateScripter,
			BadgeType.ExperiencedScripter,
			BadgeType.MasterScripter,
			BadgeType.TrueFan,
			BadgeType.TuxX,
			BadgeType.NotSoSecret,
			BadgeType.JunkHunter,
			BadgeType.LooterWannabe,
			BadgeType.ActualLooter,
			BadgeType.CrateAddict,
			BadgeType.Human,
			BadgeType.BeepBoop,
			BadgeType.Commander,
			BadgeType.Mastermind,
			BadgeType.UninvitedDev
		];
	},

	/**
	 * @param {BadgeType} badge
	 */
	getInfo(badge) {
		// TODO
	},

	/**
	 * @param {BadgeType} badge
	 * @returns {string}
	 */
	getName(badge) {
		switch (badge) {
			case BadgeType.EmptyInventory: {
				return "Not a Single Item";
			}

			case BadgeType.ApprenticeScripter: {
				return "The Apprentice Scripter";
			}

			case BadgeType.IntermediateScripter: {
				return "The Intermediate Scripter";
			}

			case BadgeType.ExperiencedScripter: {
				return "The Experienced Scripter";
			}

			case BadgeType.MasterScripter: {
				return "The Master Scripter";
			}

			case BadgeType.TrueFan: {
				return "The True Fan";
			}

			case BadgeType.TuxX: {
				return "Tux X";
			}

			case BadgeType.NotSoSecret: {
				return "Not So Secret Anymore";
			}

			case BadgeType.JunkHunter: {
				return "Junk Hunter";
			}

			case BadgeType.LooterWannabe: {
				return "Looter Wannabe";
			}

			case BadgeType.ActualLooter: {
				return "Actual Looter";
			}

			case BadgeType.CrateAddict: {
				return "Crate Addict";
			}

			case BadgeType.Human: {
				return "Human?";
			}

			case BadgeType.BeepBoop: {
				return "Beep Boop";
			}

			case BadgeType.Commander: {
				return "The Commander";
			}

			case BadgeType.Mastermind: {
				return "The Mastermind";
			}

			case BadgeType.UninvitedDev: {
				return "The Uninvited Developer (Hacker)";
			}

			default: {
				throw new Error(`[BadgeType.getName] Invalid badge type: ${badge}`);
			}
		}
	},

	/**
	 * @param {BadgeType} badge The badge
	 * @returns {string} The badge's description
	 */
	getDescription(badge) {
		switch (badge) {
			case BadgeType.EmptyInventory: {
				return "Use the inventory command and have no items";
			}

			case BadgeType.ApprenticeScripter: {
				return "Send 10 message including JavaScript code blocks";
			}

			case BadgeType.IntermediateScripter: {
				return "Send 50 message including JavaScript code blocks";
			}

			case BadgeType.ExperiencedScripter: {
				return "Send 100 message including JavaScript code blocks";
			}

			case BadgeType.MasterScripter: {
				return "Send 300 message including JavaScript code blocks";
			}

			case BadgeType.TrueFan: {
				return "Send a message containing the Tux emoji";
			}

			case BadgeType.TuxX: {
				return "Activate Tux's X mode";
			}

			case BadgeType.NotSoSecret: {
				return "Use the secret command";
			}

			case BadgeType.JunkHunter: {
				return "Open your first crate";
			}

			case BadgeType.LooterWannabe: {
				return "Open 10 crates";
			}

			case BadgeType.ActualLooter: {
				return "Open 50 crates";
			}

			case BadgeType.CrateAddict: {
				return "Open 100 crates";
			}

			case BadgeType.Human: {
				return "Issue 1,000 commands";
			}

			case BadgeType.BeepBoop: {
				return "Get Tux to somehow say Beep Boop";
			}

			case BadgeType.Commander: {
				return "Buy all the commands";
			}

			case BadgeType.Mastermind: {
				return "Earn all the badges";
			}

			case BadgeType.UninvitedDev: {
				return "Cause Tux to throw an error";
			}

			default: {
				throw new Error(`[BadgeType.getDescription] Invalid badge type: ${badge}`);
			}
		}
	}
};

export default BadgeType;
