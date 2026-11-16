const { EventEmitter } = require("node:events");

class EventBus {
    constructor({ logger = console } = {}) {
        this.emitter = new EventEmitter();
        this.logger = logger;
        this.currentDispatch = null;
    }

    on(eventName, listener) {
        if (typeof listener !== "function") {
            throw new TypeError("Event listener must be a function");
        }

        const wrappedListener = payload => {
            const dispatch = this.currentDispatch;

            const task = Promise.resolve()
                .then(() => listener(payload))
                .catch(error => {
                    this.logger.error(
                        `[event-bus] Listener failed for "${eventName}":`,
                        error
                    );
                });

            if (dispatch) {
                dispatch.push(task);
            } else {
                void task;
            }
        };

        this.emitter.on(eventName, wrappedListener);

        return () => {
            this.emitter.off(eventName, wrappedListener);
        };
    }

    async publish(eventName, payload) {
        const pending = [];
        const previousDispatch = this.currentDispatch;

        this.currentDispatch = pending;

        try {
            this.emitter.emit(eventName, payload);
        } finally {
            this.currentDispatch = previousDispatch;
        }

        await Promise.all(pending);
    }
}

module.exports = { EventBus };
