/**
 * @enum {Number}
 * @readonly
 */
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
	 * @returns {String}
	 */
	toString(type) {
		switch (type) {
			case this.Guest:
				return "Guest";

			case this.Member:
				return "Member";

			case this.Premium:
				return "Premium";

			case this.Moderator:
				return "Moderator";

			case this.Admin:
				return "Admin";

			case this.Owner:
				return "Owner";

			case this.Developer:
				return "Developer";

			default:
				return "Unknown";
		}
	},

	/**
	 * @param {String} string
	 * @returns {AccessLevelType}
	 */
	fromString(string) {
		switch (string.toLowerCase()) {
			case "guest":
				return this.Guest;

			case "member":
				return this.Member;

			case "premium":
				return this.Premium;

			case "moderator":
				return this.Moderator;

			case "admin":
				return this.Admin;

			case "owner":
				return this.Owner;

			case "developer":
				return this.Developer;

			default:
				return -1;
		}
	}
};

export default AccessLevelType;
