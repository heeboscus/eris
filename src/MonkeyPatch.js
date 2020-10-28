const Eris = require("eris");
Object.defineProperty(Eris.User.prototype, "tag", {
	get(that) {
		return `${that.username}#${that.discriminator}`;
	}
});

Object.defineProperty(Eris.Member.prototype, "tag", {
	get(that) {
		return `${that.username}#${that.discriminator}`;
	}
});

Object.defineProperty(Eris.Channel.prototype, "send", {
	get(that) {
		return that.createMessage;
	}
});

Object.defineProperty(Eris.Guild.prototype, "me", {
	get(that) {
		return that.members.get(that._client.user.id);
	}
});
