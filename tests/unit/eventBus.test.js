const { EventBus } = require("../../src/events/eventBus");

describe("EventBus", () => {
    test("publishes event to registered listeners", async () => {
        const eventBus = new EventBus();
        const listener = jest.fn();

        eventBus.on("reservation.created", listener);

        const payload = {
            reservationId: 1,
            roomId: 2,
            userId: 3
        };

        await eventBus.publish("reservation.created", payload);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(payload);
    });

    test("isolates synchronous listener errors", async () => {
        const logger = {
            error: jest.fn()
        };

        const eventBus = new EventBus({ logger });

        const failingListener = jest.fn(() => {
            throw new Error("Listener failure");
        });

        const workingListener = jest.fn();

        eventBus.on("reservation.created", failingListener);
        eventBus.on("reservation.created", workingListener);

        await expect(
            eventBus.publish("reservation.created", {})
        ).resolves.toBeUndefined();

        expect(failingListener).toHaveBeenCalledTimes(1);
        expect(workingListener).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledTimes(1);
    });

    test("isolates asynchronous listener errors", async () => {
        const logger = {
            error: jest.fn()
        };

        const eventBus = new EventBus({ logger });

        eventBus.on("reservation.created", async () => {
            throw new Error("Async listener failure");
        });

        await expect(
            eventBus.publish("reservation.created", {})
        ).resolves.toBeUndefined();

        expect(logger.error).toHaveBeenCalledTimes(1);
    });

    test("waits for asynchronous listeners", async () => {
        const eventBus = new EventBus();
        const listener = jest.fn(async () => {
            return "completed";
        });

        eventBus.on("reservation.created", listener);

        await eventBus.publish("reservation.created", {});

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("allows listener unsubscription", async () => {
        const eventBus = new EventBus();
        const listener = jest.fn();

        const unsubscribe = eventBus.on(
            "reservation.created",
            listener
        );

        unsubscribe();

        await eventBus.publish("reservation.created", {});

        expect(listener).not.toHaveBeenCalled();
    });
});
