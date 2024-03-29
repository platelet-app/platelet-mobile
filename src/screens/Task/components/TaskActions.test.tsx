import TaskActions from "./TaskActions";
import { render, fireEvent, waitFor, screen } from "../../../test-utils";

import { DataStore } from "aws-amplify";
import * as models from "../../../models";
const dateCreated = new Date().toISOString().split("T")[0];
const tenantId = "test-tenant-id";

describe("TaskActions", () => {
    const RealDate = Date;
    const isoDate = "2021-11-29T23:24:58.987Z";

    function mockDate() {
        global.Date = class extends RealDate {
            constructor() {
                super();
                return new RealDate(isoDate);
            }
        };
    }

    const finishLoading = async (button = "Cancelled") => {
        await waitFor(() => {
            expect(screen.getByRole("button", { name: button })).toBeEnabled();
        });
    };
    beforeEach(async () => {
        jest.restoreAllMocks();
        mockDate();
    });
    beforeAll(async () => {
        jest.useFakeTimers();
    });
    afterEach(async () => {
        await DataStore.clear();
    });
    test("render with a task", async () => {
        const task = await DataStore.save(
            new models.Task({
                tenantId,
                status: models.TaskStatus.ACTIVE,
                dateCreated,
            })
        );
        render(<TaskActions taskId={task.id} />);
        await finishLoading();
    });
    test("all buttons are disabled when isFetching state is set", async () => {
        const task = await DataStore.save(
            new models.Task({
                tenantId,
                status: models.TaskStatus.ACTIVE,
                dateCreated,
            })
        );
        render(<TaskActions taskId={task.id} />);
        expect(
            screen.getByRole("button", { name: "Picked up" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Delivered" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Cancelled" })
        ).toBeDisabled();
        expect(screen.getByRole("button", { name: "Rejected" })).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Rider home" })
        ).toBeDisabled();
        await finishLoading();
    });

    test.each`
        key
        ${"timeDroppedOff"} | ${"timeRiderHome"}
    `("all buttons are enabled when the state is weird", async ({ key }) => {
        const querySpy = jest.spyOn(DataStore, "query");

        const task = await DataStore.save(
            new models.Task({
                status: models.TaskStatus.ACTIVE,
                [key]: new Date().toISOString(),
                tenantId,
                dateCreated,
            })
        );
        render(<TaskActions taskId={task.id} />);
        await finishLoading();
        expect(screen.getByRole("button", { name: "Picked up" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Delivered" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Cancelled" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Rejected" })).toBeEnabled();
        expect(
            screen.getByRole("button", { name: "Rider home" })
        ).toBeEnabled();
        await waitFor(() => {
            expect(querySpy).toHaveBeenCalledTimes(1);
        });
    });
    test("all buttons are disabled if the task is PENDING", async () => {
        const mockTask = new models.Task({
            tenantId,
            dateCreated,
            status: models.TaskStatus.PENDING,
        });
        await DataStore.save(mockTask);
        const spy = jest.spyOn(DataStore, "query");
        render(<TaskActions taskId={mockTask.id} />);
        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1);
        });
        expect(
            screen.getByRole("button", { name: "Picked up" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Delivered" })
        ).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Cancelled" })
        ).toBeDisabled();
        expect(screen.getByRole("button", { name: "Rejected" })).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Rider home" })
        ).toBeDisabled();
    });
    it("clicks the picked up button", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Picked up" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the picked up time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        // expect button to be toggled
        const buttonDroppedOff = await screen.findByRole("button", {
            name: "Delivered",
        });
        expect(buttonDroppedOff).toBeEnabled();
        expect(button.props.accessibilityState.selected).toBe(true);
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timePickedUp: isoDate,
                status: models.TaskStatus.PICKED_UP,
                timePickedUpSenderName: null,
            });
        });
    });
    it("clicks the picked up button and adds a sender name", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Picked up" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the picked up time/);
        fireEvent(
            screen.getByPlaceholderText("Sender name"),
            "onChangeText",
            "someone person"
        );
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...mockTask,
                timePickedUp: isoDate,
                status: models.TaskStatus.PICKED_UP,
                timePickedUpSenderName: "someone person",
            });
        });
    });
    test("delivered button is disabled without timePickedUp set", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Delivered" });
        expect(button).toBeDisabled();
    });
    it("clicks the delivered button when timePickedUp is set", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                timePickedUp: isoDate,
                status: models.TaskStatus.PICKED_UP,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Delivered" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the delivered time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timeDroppedOff: isoDate,
                status: models.TaskStatus.DROPPED_OFF,
                timeDroppedOffRecipientName: null,
            });
        });
        expect(button.props.accessibilityState.selected).toBe(true);
    });
    it("clicks the delivered button and adds recipient name", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                timePickedUp: isoDate,
                status: models.TaskStatus.PICKED_UP,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Delivered" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the delivered time/);
        fireEvent(
            screen.getByPlaceholderText("Recipient name"),
            "onChangeText",
            "someone person"
        );
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...mockTask,
                timeDroppedOff: isoDate,
                status: models.TaskStatus.DROPPED_OFF,
                timeDroppedOffRecipientName: "someone person",
            });
        });
    });
    it("clicks the rider home button", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                timePickedUp: isoDate,
                timeDroppedOff: isoDate,
                status: models.TaskStatus.DROPPED_OFF,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading("Rider home");
        const button = screen.getByRole("button", { name: "Rider home" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the rider home time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timeRiderHome: isoDate,
                status: models.TaskStatus.COMPLETED,
            });
        });
        expect(button.props.accessibilityState.selected).toBe(true);
    });
    test("rider home button is disabled", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.PICKED_UP,
                timePickedUp: isoDate,
                timeDroppedOff: null,
            })
        );
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Rider home" });
        expect(button).toBeDisabled();
    });
    it("clicks the cancelled button", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Cancelled" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the cancelled time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...mockTask,
                timeCancelled: isoDate,
                status: models.TaskStatus.CANCELLED,
            });
        });
    });
    it("clicks the rejected button", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Rejected" });
        fireEvent(button, "onPress");
        screen.getByText(/Set the rejected time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...mockTask,
                timeRejected: isoDate,
                status: models.TaskStatus.REJECTED,
            });
        });
    });
    test("rejected and cancelled are disabled when timePickedUp and timeDroppedOff is set", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.DROPPED_OFF,
                timePickedUp: isoDate,
                timeDroppedOff: isoDate,
            })
        );
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading("Rider home");
        const rejectedButton = screen.getByRole("button", { name: "Rejected" });
        const cancelButton = screen.getByRole("button", { name: "Cancelled" });
        expect(rejectedButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });
    test("delivered is disabled if rider home is set", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.COMPLETED,
                timePickedUp: isoDate,
                timeDroppedOff: isoDate,
                timeRiderHome: isoDate,
            })
        );
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading("Rider home");
        const deliveredButton = screen.getByRole("button", {
            name: "Delivered",
        });
        expect(deliveredButton).toBeDisabled();
    });
    test("untoggle time picked up", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.PICKED_UP,
                timePickedUp: isoDate,
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );

        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Picked up" });
        fireEvent(button, "onPress");
        screen.getByText(/Clear the picked up time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timePickedUp: null,
                status: models.TaskStatus.ACTIVE,
                timePickedUpSenderName: null,
            });
        });
    });
    test("untoggle time delivered", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.DROPPED_OFF,
                timePickedUp: isoDate,
                timeDroppedOff: isoDate,
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading("Delivered");
        const button = screen.getByRole("button", { name: "Delivered" });
        fireEvent(button, "onPress");
        screen.getByText(/Clear the delivered time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timeDroppedOff: null,
                status: models.TaskStatus.PICKED_UP,
                timeDroppedOffRecipientName: null,
            });
        });
    });
    test("untoggle time cancelled", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.CANCELLED,
                timeCancelled: isoDate,
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Cancelled" });
        fireEvent(button, "onPress");
        screen.getByText(/Clear the cancelled time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timeCancelled: null,
                status: models.TaskStatus.ACTIVE,
            });
        });
    });
    test("untoggle time rejected", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.REJECTED,
                timeRejected: isoDate,
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading("Rejected");
        const button = screen.getByRole("button", { name: "Rejected" });
        fireEvent(button, "onPress");
        screen.getByText(/Clear the rejected time/);
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                timeRejected: null,
                status: models.TaskStatus.ACTIVE,
            });
        });
    });
    test("observer is unsubscribed on unmount", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        const unsubscribe = jest.fn();
        const observeSpy = jest
            .spyOn(DataStore, "observe")
            .mockImplementation(() => {
                return {
                    subscribe: () => ({ unsubscribe }),
                };
            });
        const { component } = render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();

        expect(observeSpy).toHaveBeenCalledTimes(1);
        component.unmount();
        await waitFor(() => {
            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });
    });
    test("observer updates component on task update", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        const button = screen.getByRole("button", { name: "Picked up" });
        expect(button.props.accessibilityState.selected).toBe(false);
        await DataStore.save(
            models.Task.copyOf(mockTask, (updated) => {
                updated.timePickedUp = isoDate;
                updated.status = models.TaskStatus.PICKED_UP;
            })
        );
        await waitFor(() => {
            expect(button.props.accessibilityState.selected).toBe(true);
        });
        screen.getByText("23:24");
    });
    test("observer disables buttons on task deleted", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.ACTIVE,
            })
        );
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        await DataStore.delete(mockTask);
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Picked up" })
            ).toBeDisabled();
        });
        const buttons = screen.getAllByRole("button");
        // expect all buttons to be disabled
        buttons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });
    // this doesn't really test much, but the date picker refuses to work with testing library
    test.each`
        status
        ${models.TaskStatus.CANCELLED} | ${models.TaskStatus.REJECTED} | ${models.TaskStatus.COMPLETED}
    `(
        "change the times without a name",
        async ({ status }: { status: models.TaskStatus }) => {
            const date = new Date();
            let mockTask: models.Task;
            if (status === models.TaskStatus.CANCELLED) {
                mockTask = new models.Task({
                    tenantId,
                    dateCreated,
                    status,
                    timeCancelled: date.toISOString(),
                });
            } else if (status === models.TaskStatus.REJECTED) {
                mockTask = new models.Task({
                    tenantId,
                    dateCreated,
                    status,
                    timeRejected: date.toISOString(),
                });
            } else {
                mockTask = new models.Task({
                    tenantId,
                    dateCreated,
                    status,
                    timePickedUp: date.toISOString(),
                    timeDroppedOff: date.toISOString(),
                    timeRiderHome: date.toISOString(),
                });
            }
            await DataStore.save(mockTask);

            const rider = await DataStore.save(
                new models.User({
                    tenantId,
                    cognitoId: "rider",
                    username: "rider",
                    displayName: "rider",
                    roles: [models.Role.RIDER],
                })
            );
            await DataStore.save(
                new models.TaskAssignee({
                    tenantId,
                    task: mockTask,
                    assignee: rider,
                    role: models.Role.RIDER,
                })
            );
            const saveSpy = jest.spyOn(DataStore, "save");
            render(<TaskActions taskId={mockTask.id} />);
            let buttonCheck = "";
            if (status === models.TaskStatus.CANCELLED) {
                buttonCheck = "Cancelled";
            } else if (status === models.TaskStatus.REJECTED) {
                buttonCheck = "Rejected";
            } else {
                buttonCheck = "Rider home";
            }
            await finishLoading(buttonCheck);
            if (status === models.TaskStatus.REJECTED) {
                fireEvent(
                    screen.getByRole("button", { name: "Edit Rejected" }),
                    "onPress"
                );
                const okButton = screen.getByRole("button", { name: "OK" });
                fireEvent(okButton, "onPress");
                await waitFor(() => {
                    expect(saveSpy).toHaveBeenCalledWith({
                        ...mockTask,
                        timeRejected: isoDate,
                    });
                });
            } else if (status === models.TaskStatus.CANCELLED) {
                fireEvent(
                    screen.getByRole("button", { name: "Edit Cancelled" }),
                    "onPress"
                );
                // don't know why get by placeholder or label doesn't work here
                const okButton = screen.getByRole("button", { name: "OK" });
                fireEvent(okButton, "onPress");
                await waitFor(() => {
                    expect(saveSpy).toHaveBeenCalledWith({
                        ...mockTask,
                        timeCancelled: isoDate,
                    });
                });
            } else if (status === models.TaskStatus.COMPLETED) {
                fireEvent(
                    screen.getByRole("button", { name: "Edit Rider home" }),
                    "onPress"
                );
                const okButton = screen.getByRole("button", { name: "OK" });
                fireEvent(okButton, "onPress");
                await waitFor(() => {
                    expect(saveSpy).toHaveBeenCalledWith({
                        ...mockTask,
                        timeRiderHome: isoDate,
                    });
                });
            }
        }
    );

    test("change the sender name", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.PICKED_UP,
                timePickedUp: isoDate,
                timePickedUpSenderName: "sender",
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading();
        fireEvent(
            screen.getByRole("button", { name: "Edit Picked up" }),
            "onPress"
        );
        const input = screen.getByDisplayValue("sender");
        fireEvent.changeText(input, "new sender");
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...mockTask,
                timePickedUpSenderName: "new sender",
                timePickedUp: isoDate,
            });
        });
    });
    test("change the recipient name", async () => {
        const mockTask = await DataStore.save(
            new models.Task({
                tenantId,
                dateCreated,
                status: models.TaskStatus.DROPPED_OFF,
                timePickedUp: isoDate,
                timeDroppedOff: isoDate,
                timeDroppedOffRecipientName: "recipient",
            })
        );
        const rider = await DataStore.save(
            new models.User({
                tenantId,
                cognitoId: "rider",
                username: "rider",
                displayName: "rider",
                roles: [models.Role.RIDER],
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                tenantId,
                task: mockTask,
                assignee: rider,
                role: models.Role.RIDER,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskActions taskId={mockTask.id} />);
        await finishLoading("Delivered");
        fireEvent(
            screen.getByRole("button", { name: "Edit Delivered" }),
            "onPress"
        );
        const input = screen.getByDisplayValue("recipient");
        fireEvent.changeText(input, "new recipient");
        const okButton = screen.getByRole("button", { name: "OK" });
        fireEvent(okButton, "onPress");
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...mockTask,
                timeDroppedOffRecipientName: "new recipient",
                timePickedUp: isoDate,
            });
        });
    });
});
