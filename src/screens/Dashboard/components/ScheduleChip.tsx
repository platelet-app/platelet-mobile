import * as React from "react";
import * as models from "../../../models";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import taskScheduleDueStatus from "../../../utilities/taskScheduleDueStatus";
import taskScheduleOverDueStatus from "../../../utilities/taskScheduleOverDueStatus";
import SmallChip from "./SmallChip";
import humanReadableScheduleString from "../../../utilities/humanReadableScheduleString";
import { Text } from "react-native-paper";
import { View } from "react-native";

type ScheduleChipProps = {
    schedule: models.Schedule;
    icon?: React.ReactElement;
};

const ScheduleChip: React.FC<ScheduleChipProps> = ({
    schedule,
    icon = <FontAwesome5 name={"clock"} />,
}) => {
    let iconColor: string | undefined = undefined;
    const dueStatus = taskScheduleDueStatus(schedule, 1, 0);
    const overDueStatus = taskScheduleOverDueStatus(schedule);

    if (dueStatus) {
        iconColor = "orange";
    }
    if (overDueStatus) {
        iconColor = "red";
    }
    const iconComponent = React.cloneElement(icon, {
        color: iconColor,
        size: 20,
    });
    let message = humanReadableScheduleString(schedule, true);
    if (message.length > 16) {
        message = message.substring(0, 16) + "...";
    }

    return (
        <SmallChip
            style={{
                borderWidth: 1,
                marginRight: 4,
                borderColor: "white",
            }}
        >
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Text>{iconComponent}</Text>
                <Text style={{ fontSize: 12 }}>{message}</Text>
            </View>
        </SmallChip>
    );
};

export default ScheduleChip;
