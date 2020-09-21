
class StreamError extends Error{}

class StreamEndedError extends StreamError {}
class TwitchLoginError extends StreamError {}

module.exports = {
    'StreamError': StreamError,
    'StreamEndedError': StreamEndedError,
    'TwitchLoginError': TwitchLoginError
}
