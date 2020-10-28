const Eris = require("eris");
Object.defineProperty(Eris.User.prototype, "tag", {
	get(this) {
		return `${this.username}#${this.discriminator}`;
	}
});

Object.defineProperty(Eris.Member.prototype, "tag", {
	get(this) {
		return `${this.username}#${this.discriminator}`;
	}
});

Object.defineProperty(Eris.Channel.prototype, "send", {
	get(this) {
		return this.createMessage;
	}
});

Object.defineProperty(Eris.Guild.prototype, "me", {
	get(this) {
		return this.members.get(this._client.user.id);
	}
});
