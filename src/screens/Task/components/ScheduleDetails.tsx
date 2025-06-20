import * as React from "react";
import * as models from "../../../models";
import { View } from "react-native";
import { Text } from "react-native-paper";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import taskScheduleDueStatus from "../../../utilities/taskScheduleDueStatus";
import taskScheduleOverDueStatus from "../../../utilities/taskScheduleOverDueStatus";
import { useTranslation } from "react-i18next";
import humanReadableScheduleString from "../../../utilities/humanReadableScheduleString";

type ScheduleDetailsProps = {
    schedule?: models.Schedule | null;
};

const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({ schedule }) => {
    if (!schedule) return null;
    const dueStatus = taskScheduleDueStatus(schedule);
    const overDueStatus = taskScheduleOverDueStatus(schedule);
    let iconColor = "";

    if (dueStatus) iconColor = "orange";
    if (overDueStatus) iconColor = "red";

    const { t } = useTranslation();

    return (
        <View
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
            }}
        >
            <Text>
                <FontAwesome5 color={iconColor} size={20} name="clock" />
            </Text>
            <Text>{humanReadableScheduleString(t, schedule)}</Text>
        </View>
    );
};

export default ScheduleDetails;
