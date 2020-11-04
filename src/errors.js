class NoPrivate extends Error {}

class MissingBotPerms extends Error {}

class MissingMemberPerms extends Error {}

class CheckFailure extends Error {}

class MissingArguments extends Error {}

class InvalidArguments extends Error {}

class ExecutionError extends Error {}

module.exports = { NoPrivate, MissingBotPerms, MissingMemberPerms, CheckFailure, MissingArguments, InvalidArguments, ExecutionError }