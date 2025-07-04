import * as React from "react";
import {
    GestureResponderEvent,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import TaskCardLocationDetail from "./TaskCardLocationDetail";
import CommentsBadge from "./CommentsBadge";
import TaskCardTimestamp from "./TaskCardTimestamp";
import TaskCardChips from "./TaskCardChips";
import useTaskDeliverablesRedux from "../../../hooks/useTaskDeliverablesRedux";
import useCommentsRedux from "../../../hooks/useCommentsRedux";
import { IconButton, useTheme } from "react-native-paper";
import { ResolvedTask } from "../../../hooks/useMyAssignedTasks";
import { useDispatch, useSelector } from "react-redux";
import {
    selectItem,
    unselectItem,
} from "../../../redux/selectionMode/selectionModeActions";
import { selectedItemsSelector } from "../../../redux/Selectors";
import * as models from "../../../models";

type TaskCardProps = {
    task: ResolvedTask;
    onPress?: () => void;
    tabIndex: number;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, tabIndex }) => {
    const deliverables = useTaskDeliverablesRedux(task.id);
    const comments = useCommentsRedux(task.id);
    const dispatch = useDispatch();
    const selectedItems = useSelector(selectedItemsSelector)[tabIndex];
    const [isSelected, setIsSelected] = React.useState(false);
    const itemsSelected = selectedItems
        ? Object.values(selectedItems).length > 0
        : false;

    const calculateIsSelected = () => {
        const itemsTab: models.Task[] = selectedItems;
        let result = false;
        if (itemsTab) {
            result = Object.values(itemsTab)
                .map((t: models.Task) => t.id)
                .includes(task.id);
        }
        setIsSelected(result);
    };
    React.useEffect(calculateIsSelected, [selectedItems, task.id, tabIndex]);

    let taskBadge = <></>;

    if (comments) {
        if (comments.length > 0) {
            taskBadge = <CommentsBadge count={comments.length} />;
        }
    }

    const handleSelect = (_: GestureResponderEvent, vibrate = true) => {
        if (isSelected) {
            dispatch(unselectItem(task.id, tabIndex));
        } else {
            dispatch(selectItem(task, tabIndex));
        }
        if (vibrate) Vibration.vibrate(50);
    };

    const cutOff = 3;
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={(e) => handleSelect(e)}
        >
            <TaskCardChips
                status={task.status as models.TaskStatus}
                pickUpSchedule={task.pickUpSchedule}
                dropOffSchedule={task.dropOffSchedule}
                limit={cutOff}
                deliverables={deliverables}
                priority={task.priority}
                riderResponsibility={task.riderResponsibility}
            />
            <TaskCardLocationDetail
                nullLocationText="No pick up address"
                location={task.pickUpLocation}
            />
            <TaskCardLocationDetail
                nullLocationText="No delivery address"
                location={task.dropOffLocation}
            />
            <View style={{ height: 8 }} />
            <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
                {(task?.createdAt || task?.timeOfCall) && (
                    <TaskCardTimestamp
                        timestamp={task.createdAt || task.timeOfCall || ""}
                    />
                )}
                {taskBadge}
            </View>
            {isSelected && (
                <View
                    style={{
                        backgroundColor: colors.primary,
                        borderRadius: 8,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0.5,
                    }}
                />
            )}
            {itemsSelected && (
                <IconButton
                    aria-label={isSelected ? "Unselect task" : "Select task"}
                    icon={
                        isSelected
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                    }
                    iconColor="white"
                    style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        backgroundColor: "black",
                    }}
                    onPress={(e) => handleSelect(e, false)}
                    onLongPress={(e) => handleSelect(e, true)}
                />
            )}
        </TouchableOpacity>
    );
};

export default TaskCard;
