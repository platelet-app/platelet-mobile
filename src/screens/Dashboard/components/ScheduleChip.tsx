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
};

const ScheduleChip: React.FC<ScheduleChipProps> = ({ schedule }) => {
    let iconColor = "";
    const dueStatus = taskScheduleDueStatus(schedule);
    const overDueStatus = taskScheduleOverDueStatus(schedule);

    if (dueStatus) {
        iconColor = "orange";
    }
    if (overDueStatus) {
        iconColor = "red";
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
                    gap: 10,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Text>
                    <FontAwesome5 color={iconColor} size={20} name="clock" />
                </Text>
                <Text>{humanReadableScheduleString(schedule, true)}</Text>
            </View>
        </SmallChip>
    );
};

export default ScheduleChip;
