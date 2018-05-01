const AccessLevelType = {
	Guest: 0,
	Member: 1,
	Premium: 2,
	Moderator: 3,
	Admin: 4,
	Owner: 5,
	Developer: 6,

	/**
	 * @param {AccessLevelType} type
	 */
	toString(type) {
		switch (type) {
			case AccessLevelType.Guest:
				return "Guest";

			case AccessLevelType.Member:
				return "Member";

			case AccessLevelType.Premium:
				return "Premium";

			case AccessLevelType.Moderator:
				return "Moderator";

			case AccessLevelType.Admin:
				return "Admin";

			case AccessLevelType.Owner:
				return "Owner";

			case AccessLevelType.Developer:
				return "Developer";

			default:
				return "Unknown";
		}
	},

	/**
	 * @param {string} string
	 * @returns {AccessLevelType}
	 */
	fromString(string) {
		switch (string.toLowerCase()) {
			case "guest":
				return AccessLevelType.Guest;

			case "member":
				return AccessLevelType.Member;

			case "premium":
				return AccessLevelType.Premium;

			case "moderator":
				return AccessLevelType.Moderator;

			case "admin":
				return AccessLevelType.Admin;

			case "owner":
				return AccessLevelType.Owner;

			case "developer":
				return AccessLevelType.Developer;

			default:
				return -1;
		}
	}
};

export default AccessLevelType;
