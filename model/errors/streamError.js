
class StreamError extends Error{}

class StreamEndedError extends StreamError {}

module.exports = {
    'StreamError': StreamError,
    'StreamEndedError': StreamEndedError
}
