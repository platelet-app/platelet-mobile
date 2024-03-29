import * as React from "react";
import * as models from "../models";
import { useSelector } from "react-redux";
import { getWhoami } from "../redux/Selectors";
import { DataStore } from "aws-amplify";
import convertModelListToTypedObject from "./utilities/convertModelListToTypedObject";
import _ from "lodash";
import useAppActiveStatus from "./useAppActiveStatus";
import { DAYS_AGO } from "./utilities/getTasksConsts";

export type ResolvedTask = Omit<
    models.Task,
    "pickUpLocation" | "dropOffLocation"
> & {
    pickUpLocation: models.Location | null;
    dropOffLocation: models.Location | null;
};

type StateType = {
    [id: string]: ResolvedTask;
};

const log = (message: any) => {
    console.log(`[useMyAssignedTasks] ${message}`);
};

const useMyAssignedTasks = (
    status: models.TaskStatus[] | models.TaskStatus,
    role: models.Role.COORDINATOR | models.Role.RIDER,
    limit: boolean = false
) => {
    const whoami = useSelector(getWhoami);
    const assigneeObserver = React.useRef({ unsubscribe: () => {} });
    const tasksObserver = React.useRef({ unsubscribe: () => {} });
    const locationObserver = React.useRef({ unsubscribe: () => {} });
    const stateRef = React.useRef<StateType>({});
    const taskIdsRef = React.useRef<string[] | null>(null);
    const [taskIds, setTaskIds] = React.useState<string[] | null>(null);
    const [state, setState] = React.useState<StateType>({});
    const [error, setError] = React.useState<Error | null>(null);
    const [isFetching, setIsFetching] = React.useState(true);
    const isFetchingAssigneesRef = React.useRef(true);
    const appStatus = useAppActiveStatus();

    stateRef.current = state;
    taskIdsRef.current = taskIds;

    let actualStatus: models.TaskStatus[] = React.useMemo(() => {
        if (!Array.isArray(status)) {
            return [status];
        } else {
            return status;
        }
    }, [status]);

    const setUpTasksObserver = React.useCallback(() => {
        // when appStatus changes back to the foreground, we want to restart the observer
        if (appStatus !== "active") {
            tasksObserver.current.unsubscribe();
            return;
        }
        if (isFetchingAssigneesRef.current) {
            return;
        }
        log("setting up tasks observer");
        const daysAgo = new Date();
        daysAgo.setHours(0, 0, 0, 0);
        daysAgo.setDate(daysAgo.getDate() - DAYS_AGO);
        const daysAgoString = daysAgo.toISOString();
        try {
            tasksObserver.current.unsubscribe();
            if (limit) {
                tasksObserver.current = DataStore.observeQuery(
                    models.Task,
                    (t) =>
                        t.and((t) => [
                            t.or((t) =>
                                actualStatus.map((s) => t.status.eq(s))
                            ),
                            t.or((t) => [
                                t.dateCompleted.eq(undefined),
                                t.dateCompleted.eq(null),
                                t.dateCompleted.gt(daysAgoString),
                            ]),
                        ]),
                    { sort: (s) => s.createdAt("DESCENDING") }
                ).subscribe(async ({ items }) => {
                    const filtered = items.filter((t) =>
                        taskIdsRef.current?.includes(t.id)
                    );
                    const resolvedTasks: ResolvedTask[] = await Promise.all(
                        filtered.map(async (t) => {
                            const pickUpLocation =
                                (await t.pickUpLocation) || null;
                            const dropOffLocation =
                                (await t.dropOffLocation) || null;
                            return {
                                ...t,
                                pickUpLocation,
                                dropOffLocation,
                            };
                        })
                    );
                    setState(
                        convertModelListToTypedObject<ResolvedTask>(
                            resolvedTasks
                        )
                    );
                    setIsFetching(false);
                });
            } else {
                tasksObserver.current = DataStore.observeQuery(
                    models.Task,
                    (t) =>
                        t.and((t) => [
                            t.or((t) =>
                                actualStatus.map((s) => t.status.eq(s))
                            ),
                        ]),
                    { sort: (s) => s.createdAt("DESCENDING") }
                ).subscribe(async ({ items }) => {
                    const filtered = items.filter((t) =>
                        taskIdsRef.current?.includes(t.id)
                    );
                    const resolvedTasks: ResolvedTask[] = await Promise.all(
                        filtered.map(async (t) => {
                            const pickUpLocation =
                                (await t.pickUpLocation) || null;
                            const dropOffLocation =
                                (await t.dropOffLocation) || null;
                            return {
                                ...t,
                                pickUpLocation,
                                dropOffLocation,
                            };
                        })
                    );
                    setState(
                        convertModelListToTypedObject<ResolvedTask>(
                            resolvedTasks
                        )
                    );
                    setIsFetching(false);
                });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error);
                log(error);
            }
            setIsFetching(false);
        }
    }, [taskIds, actualStatus, limit, appStatus]);

    React.useEffect(() => {
        setUpTasksObserver();
        return () => {
            tasksObserver.current.unsubscribe();
        };
    }, [setUpTasksObserver]);

    const setUpLocationObserver = React.useCallback(() => {
        // when appStatus changes back to the foreground, we want to restart the observer
        if (appStatus !== "active") {
            locationObserver.current.unsubscribe();
            return;
        }
        log("setting up location observer");
        locationObserver.current.unsubscribe();
        locationObserver.current = DataStore.observe(models.Location).subscribe(
            async (location) => {
                try {
                    if (location.opType === "UPDATE") {
                        for (const task of Object.values(stateRef.current)) {
                            if (
                                task.pickUpLocation &&
                                task.pickUpLocation.id === location.element.id
                            ) {
                                setState((prevState) => ({
                                    ...prevState,
                                    [task.id]: {
                                        ...prevState[task.id],
                                        pickUpLocation: location.element,
                                    },
                                }));
                            }
                            if (
                                task.dropOffLocation &&
                                task.dropOffLocation.id === location.element.id
                            ) {
                                setState((prevState) => ({
                                    ...prevState,
                                    [task.id]: {
                                        ...prevState[task.id],
                                        dropOffLocation: location.element,
                                    },
                                }));
                            }
                        }
                    }
                } catch (error) {
                    log(error);
                }
            }
        );
    }, [appStatus]);

    React.useEffect(() => {
        setUpLocationObserver();
        return () => {
            locationObserver.current.unsubscribe();
        };
    }, [setUpLocationObserver]);

    const setUpAssignedTasksObserver = React.useCallback(async () => {
        // when appStatus changes back to the foreground, we want to restart the observer
        if (appStatus !== "active") {
            assigneeObserver.current.unsubscribe();
            return;
        }
        log("setting up assigned tasks observer");
        try {
            assigneeObserver.current.unsubscribe();
            assigneeObserver.current = DataStore.observeQuery(
                models.TaskAssignee,
                (a) => a.role.eq(role)
            ).subscribe(async ({ items }) => {
                const resolved = await Promise.all(
                    items.map(async (a) => {
                        const assignee = await a.assignee;
                        const task = await a.task;
                        return { ...a, assignee, task };
                    })
                );
                const filtered = resolved.filter(
                    (a) => a.assignee.id === whoami?.id
                );
                const taskIds = filtered.map((t) => t.task.id);
                if (_.isEqual(taskIds, taskIdsRef.current)) {
                    return;
                } else {
                    setTaskIds(taskIds);
                }
                isFetchingAssigneesRef.current = false;
            });
            return;
            // some alternative way using observe instead of observeQuery
            /*const initialValues = await DataStore.query(
                models.TaskAssignee,
                (t) =>
                    t.and((t) => [
                        t.role.eq(role),
                        t.assignee.id.eq(whoami?.id),
                        t.or((t) =>
                            actualStatus.map((s) => t.task.status.eq(s))
                        ),
                    ])
            );
            const resolvedTasks = await Promise.all(
                initialValues.map((t) => {
                    return t.task;
                })
            );
            const taskIds = resolvedTasks.map((t) => t.id);
            setTaskIds(new Set(taskIds));
            assigneeObserver.current.unsubscribe();
            assigneeObserver.current = DataStore.observe(
                models.TaskAssignee
            ).subscribe(async ({ opType, element }) => {
                if (opType === "DELETE") {
                    setTaskIds((prevState) => {
                        // hacky workarounds for DataStore as usual
                        // @ts-ignore
                        const taskId = element.taskAssigneesId;
                        if (prevState.has(taskId)) {
                            const newState = new Set(prevState);
                            newState.delete(taskId);
                            return newState;
                        } else {
                            return prevState;
                        }
                    });
                } else {
                    const assignment = await DataStore.query(
                        models.TaskAssignee,
                        element.id
                    );
                    const task = await assignment?.task;
                    if (!task) {
                        return;
                    }
                    const assignee = await assignment?.assignee;
                    if (
                        !assignment ||
                        assignee?.id !== whoami?.id ||
                        assignment?.role !== role ||
                        !actualStatus.some((s) => s === task?.status)
                    ) {
                        return;
                    }
                    setTaskIds((prevState) => {
                        const newState = new Set(prevState);
                        newState.add(task.id);
                        return newState;
                    });
                }
            });*/
        } catch (error: unknown) {
            if (error instanceof Error) {
                log(error);
                setError(error);
            }
        }
    }, [whoami?.id, role, appStatus]);

    React.useEffect(() => {
        setUpAssignedTasksObserver();
        return () => {
            assigneeObserver.current.unsubscribe();
        };
    }, [setUpAssignedTasksObserver]);

    return { state: Object.values(state), isFetching, error };
};

export default useMyAssignedTasks;
