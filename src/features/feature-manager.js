export default class FeatureManager {
	constructor() {
		this.features = [];
	}

	enable(feature, bot) {
		if (feature.canEnable(bot)) {
			feature.enabled(bot);
			feature.isEnabled = true;

			return true;
		}

		return false;
	}

	enableMultiple(features, bot) {
		let totalEnabled = 0;

		for (let i = 0; i < features.length; i++) {
			if (this.enable(features[i], bot)) {
				totalEnabled++;
			}
		}

		return totalEnabled;
	}

	enableAll(bot) {
		return this.enableMultiple(this.features, bot);
	}

	disable(feature, bot) {
		feature.disabled(bot);
		feature.isEnabled = false;
	}

	disableMultiple(features, bot) {
		for (let i = 0; i < features.length; i++) {
			this.disable(features[i], bot);
		}
	}

	disableAll(bot) {
		this.disableMultiple(this.features, bot);
	}

	reloadAll(bot) {
		this.disableAll(bot);

		return this.enableAll(bot);
	}

	register(feature) {
		this.features.push(feature);
	}

	registerMultiple(features) {
		for (let i = 0; i < features.length; i++) {
			this.register(features[i]);
		}
	}

	isRegistered(key) {
		return this.getByKey(key) != null;
	}

	isEnabled(key) {
		return this.getByKey(key).isEnabled;
	}

	getByKey(key) {
		// TODO: Simplify this process into a function to prevent redundancy
		for (let i = 0; i < this.features.length; i++) {
			if (this.features[i].key === key) {
				return this.features[i];
			}
		}

		return null;
	}
}
