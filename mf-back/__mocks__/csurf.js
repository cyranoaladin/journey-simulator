/**
 * Test-only noop mock to bypass csurf session requirements.
 */
const csrfMock = () => (_req, _res, next) => next();

module.exports = csrfMock;
module.exports.default = csrfMock;
