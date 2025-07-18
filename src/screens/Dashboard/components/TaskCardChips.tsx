import * as models from "../../../models";
import { StyleSheet, View } from "react-native";
import DeliverableChip from "./DeliverableChip";
import PriorityChip from "./PriorityChip";
import { List } from "react-native-paper";
import SmallChip from "./SmallChip";
import ScheduleChip from "./ScheduleChip";
import Entypo from "@expo/vector-icons/Entypo";

type ResolvedDeliverable = models.Deliverable & {
    deliverableType: models.DeliverableType;
};

type TaskCardChipsProps = {
    assignees?: (models.TaskAssignee | null)[];
    status?: models.TaskStatus | null;
    deliverables?: (ResolvedDeliverable | null)[];
    riderResponsibility?: string | null;
    // don't know why I need to write them out individually for TaskCard to not complain
    priority?: models.Priority | "HIGH" | "MEDIUM" | "LOW" | null;
    limit?: number;
    pickUpSchedule?: models.Schedule | null;
    dropOffSchedule?: models.Schedule | null;
    showDeliverableIcons?: boolean;
};

const TaskCardChips: React.FC<TaskCardChipsProps> = ({
    assignees,
    status,
    deliverables,
    riderResponsibility,
    priority,
    limit,
    pickUpSchedule,
    dropOffSchedule,
    showDeliverableIcons = false,
}) => {
    let chips = [];
    const showDefaults = [
        models.TaskStatus.NEW,
        models.TaskStatus.ACTIVE,
        models.TaskStatus.PENDING,
        models.TaskStatus.FUTURE,
    ];
    const showPickUp = status ? showDefaults.includes(status) : true;
    const showDropOff = status
        ? [...showDefaults, models.TaskStatus.PICKED_UP].includes(status)
        : true;
    if (pickUpSchedule && showPickUp) {
        const icon = <Entypo name="arrow-bold-up" />;
        chips.push(
            <ScheduleChip
                icon={icon}
                schedule={pickUpSchedule}
                key="pick-up-schedule"
            />
        );
    }
    if (dropOffSchedule && showDropOff) {
        const icon = <Entypo name="arrow-bold-down" />;
        chips.push(
            <ScheduleChip
                schedule={dropOffSchedule}
                key="drop-off-schedule"
                icon={icon}
            />
        );
    }

    if (priority) {
        chips.push(<PriorityChip priority={priority} key={priority} />);
    }
    // ignore rider responsibility for now
    if (false) {
        chips.push(
            <SmallChip style={styles.chip} key={riderResponsibility}>
                {riderResponsibility}
            </SmallChip>
        );
    }
    let assigneeChips: React.ReactElement[] = [];
    let deliverableChips: React.ReactElement[] = [];
    if (deliverables) {
        const sorted = deliverables.sort((a, b) => {
            return `${a?.deliverableType?.label} x ${b?.count}`.localeCompare(
                `${b?.deliverableType?.label} x ${a?.count}`
            );
        });
        deliverableChips = sorted.map((deliverable) => {
            if (deliverable) {
                return (
                    <DeliverableChip
                        style={styles.chip}
                        showIcon={showDeliverableIcons}
                        deliverable={deliverable}
                        key={deliverable.id}
                    />
                );
            } else {
                return <></>;
            }
        });
    }

    chips = [...chips, ...assigneeChips, ...deliverableChips];

    if (limit && chips.length > limit) {
        chips = chips.slice(0, limit);
        chips.push(
            <SmallChip style={styles.chip} key="more-chip">
                ...
            </SmallChip>
        );
    }

    return (
        <List.Section>
            <View style={styles.row}>{chips.map((chip) => chip)}</View>
        </List.Section>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    chip: {
        marginRight: 4,
    },
});

export default TaskCardChips;
