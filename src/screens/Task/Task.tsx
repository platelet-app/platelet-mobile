import { ScrollView } from "react-native";
import NotFound from "../Errors/NotFound";
import * as React from "react";
import * as models from "../../models";
import useModelSubscription from "../../hooks/useModelSubscription";
import TaskActions from "./components/TaskActions";
import TaskDetails from "./components/TaskDetails";
import TaskLocationDetail from "./components/TaskLocationDetail";
import taskStatusHumanReadable from "../../utilities/taskStatusHumanReadable";
import TaskInventoryDetail from "./components/TaskInventoryDetail";
import TaskAssigneesDetail from "./components/TaskAssigneesDetail";
import GenericError from "../Errors/GenericError";
import CommentsSection from "../../components/CommentsSection/CommentsSection";

type TaskProps = {
    route: any;
    navigation: any;
};

const Task: React.FC<TaskProps> = ({ route, navigation }) => {
    const { taskId } = route.params;
    const { state, isFetching, error, notFound } =
        useModelSubscription<models.Task>(models.Task, taskId);
    const [pickUpLocationId, setPickUpLocationId] = React.useState<
        string | null | undefined
    >(undefined);
    const [dropOffLocationId, setDropOffLocationId] = React.useState<
        string | null | undefined
    >(undefined);

    React.useEffect(() => {
        const label = taskStatusHumanReadable(
            state?.status as models.TaskStatus
        );
        navigation.setOptions({
            title: label || "",
        });
    }, [state?.status, navigation]);

    const resolveLocations = React.useCallback(async () => {
        if (isFetching) return;
        if (state?.pickUpLocation) {
            const result = await state?.pickUpLocation;
            setPickUpLocationId(result?.id || null);
        }
        if (state?.dropOffLocation) {
            const result = await state?.dropOffLocation;
            setDropOffLocationId(result?.id || null);
        }
    }, [state, isFetching]);

    React.useEffect(() => {
        resolveLocations();
    }, [resolveLocations]);

    if (error) {
        return <GenericError />;
    } else if (notFound) {
        return <NotFound />;
    } else {
        return (
            <ScrollView contentContainerStyle={{ padding: 8, gap: 8 }}>
                <TaskDetails taskId={taskId} />
                <TaskActions taskId={taskId} />
                <TaskLocationDetail
                    locationId={pickUpLocationId}
                    title="Collect from"
                    schedule={state?.pickUpSchedule}
                />

                <TaskLocationDetail
                    locationId={dropOffLocationId}
                    title="Deliver to"
                    schedule={state?.dropOffSchedule}
                />
                <TaskInventoryDetail taskId={taskId} />
                <TaskAssigneesDetail taskId={taskId} />
                <CommentsSection parentId={taskId} />
            </ScrollView>
        );
    }
};

export default Task;
