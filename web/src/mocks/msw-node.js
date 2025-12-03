function noop() {}

module.exports = {
	setupServer: (...handlers) => {
		return {
			listen: noop,
			close: noop,
			resetHandlers: noop,
			use: noop,
			events: undefined,
			handlers,
		}
	},
}
