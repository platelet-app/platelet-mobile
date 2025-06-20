import * as React from "react";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { TaskUpdateKey } from "./TaskActions";
import moment from "moment";
import { TouchableOpacity } from "react-native";
import TaskDateTimeTextInput from "./TaskDateTimeTextInput";
import useKeyboardHeight from "../../../hooks/useKeyboardHeight";
import { useTranslation } from "react-i18next";

type Value = {
    [K in TaskUpdateKey]?: string;
};

type TaskActionsConfirmationDialogProps = {
    startingValue?: string | Date | null;
    startingNameValue?: string | null;
    open: boolean;
    taskKey: TaskUpdateKey | null;
    nameKey?: "timePickedUpSenderName" | "timeDroppedOffRecipientName" | null;
    onClose: () => void;
    onConfirm: (value: Value) => void;
    nullify: boolean;
    needsReason?: boolean;
    reasonBody?: string;
    onChangeReasonBody?: (reasonBody: string) => void;
};

const humanReadableName = (
    nameKey: "timePickedUpSenderName" | "timeDroppedOffRecipientName",
    t: (key: string) => string
) => {
    switch (nameKey) {
        case "timePickedUpSenderName":
            return t("senderName");
        case "timeDroppedOffRecipientName":
            return t("recipientName");
        default:
            return "";
    }
};

const humanReadableConfirmation = (
    field: TaskUpdateKey | null,
    nullify: boolean,
    t: (key: string, options?: any) => string
) => {
    switch (field) {
        case "timePickedUp":
            return nullify
                ? t("confirmation.clearPickedUp")
                : t("confirmation.setPickedUp");
        case "timeDroppedOff":
            return nullify
                ? t("confirmation.clearDelivered")
                : t("confirmation.setDelivered");
        case "timeCancelled":
            return nullify
                ? t("confirmation.clearCancelled")
                : t("confirmation.setCancelled");
        case "timeRejected":
            return nullify
                ? t("confirmation.clearRejected")
                : t("confirmation.setRejected");
        case "timeRiderHome":
            return nullify
                ? t("confirmation.clearRiderHome")
                : t("confirmation.setRiderHome");
        default:
            return "";
    }
};

const TaskActionsConfirmationDialog: React.FC<TaskActionsConfirmationDialogProps> =
    ({
        startingValue,
        startingNameValue,
        open,
        taskKey,
        nameKey = null,
        onClose,
        onConfirm,
        nullify,
        needsReason = false,
        onChangeReasonBody,
    }) => {
        const { t } = useTranslation();
        const [value, setValue] = React.useState<Date>(
            startingValue ? new Date(startingValue) : new Date()
        );
        const [timePickerOpen, setTimePickerOpen] = React.useState(false);
        const [datePickerOpen, setDatePickerOpen] = React.useState(false);

        const keyboardHeight = useKeyboardHeight();

        const nameValue = React.useRef(startingNameValue || "");

        const setNameValue = (value: string) => {
            nameValue.current = value;
        };

        const handleConfirm = () => {
            if (!taskKey) return;
            const result = nullify ? null : value.toISOString();
            if (nameKey) {
                onConfirm({
                    [taskKey]: result,
                    [nameKey]: nameValue.current || null,
                });
            } else {
                onConfirm({ [taskKey]: result });
            }
            onClose();
        };

        return (
            <Portal>
                <Dialog
                    style={{ marginBottom: keyboardHeight || 0 }}
                    visible={open}
                    onDismiss={onClose}
                >
                    <Dialog.Title>
                        {humanReadableConfirmation(taskKey, nullify, t)}
                    </Dialog.Title>
                    <Dialog.Content>
                        {!nullify && (
                            <>
                                <TouchableOpacity
                                    onPress={() => setDatePickerOpen(true)}
                                >
                                    <TaskDateTimeTextInput
                                        value={moment(value).format(
                                            "DD/MM/YYYY"
                                        )}
                                        label={t("date")}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setTimePickerOpen(true)}
                                >
                                    <TaskDateTimeTextInput
                                        value={moment(value).format("HH:mm")}
                                        label={t("time")}
                                    />
                                </TouchableOpacity>
                                {nameKey && (
                                    <TextInput
                                        mode="outlined"
                                        defaultValue={startingNameValue || ""}
                                        onChangeText={setNameValue}
                                        aria-label={humanReadableName(nameKey, t)}
                                        placeholder={humanReadableName(nameKey, t)}
                                    />
                                )}
                                {needsReason && (
                                    <TextInput
                                        mode="outlined"
                                        onChangeText={onChangeReasonBody}
                                        aria-label={t("reason")}
                                        placeholder={t("reasonPlaceholder")}
                                        multiline
                                    />
                                )}
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={onClose}>{t("cancel")}</Button>
                        <Button onPress={handleConfirm}>{t("ok")}</Button>
                    </Dialog.Actions>
                </Dialog>
                <TimePickerModal
                    visible={timePickerOpen}
                    use24HourClock
                    onDismiss={() => setTimePickerOpen(false)}
                    onConfirm={(date) => {
                        const dateCopy = new Date(value);
                        dateCopy.setHours(date.hours);
                        dateCopy.setMinutes(date.minutes);
                        setValue(dateCopy);
                        setTimePickerOpen(false);
                    }}
                    hours={value.getHours()}
                    minutes={value.getMinutes()}
                />
                <DatePickerModal
                    locale="en-GB"
                    visible={datePickerOpen}
                    onDismiss={() => setDatePickerOpen(false)}
                    mode="single"
                    onConfirm={({ date }) => {
                        if (date) {
                            const dateCopy = new Date(value);
                            dateCopy.setFullYear(date.getFullYear());
                            dateCopy.setMonth(date.getMonth());
                            dateCopy.setDate(date.getDate());
                            setValue(dateCopy);
                            setDatePickerOpen(false);
                        }
                    }}
                    date={value}
                />
            </Portal>
        );
    };

export default TaskActionsConfirmationDialog;
