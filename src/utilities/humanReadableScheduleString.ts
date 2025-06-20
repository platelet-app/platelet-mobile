import moment from "moment";
import * as models from "../models";

const humanReadableScheduleString = (
    t: (key: string) => string,
    schedule: models.Schedule | null,
    shortened = false
) => {
    const getDayString = (date: Date | string) => {
        return moment(date).calendar(null, {
            lastDay: `[${t("yesterday")}]`,
            sameDay: `[${t("today")}]`,
            nextDay: `[${t("tomorrow")}]`,
            lastWeek: `[${t("last")}] dddd`,
            nextWeek: "dddd",
            sameElse: "L",
        });
    };

    if (!schedule) return "";
    let result = "";
    if (schedule.timePrimary) {
        const date = new Date(schedule.timePrimary);
        if (!shortened) {
            const dateString = date.toISOString().split("T")[0];
            result += getDayString(dateString);
        }
    }
    switch (schedule.relation) {
        case models.TimeRelation.ANYTIME:
            result += shortened ? t("atAnyTime") : ` ${t("atAnyTime")}`;
            break;
        case models.TimeRelation.BEFORE:
            result += shortened ? t("before") : ` ${t("before")}`;
            break;
        case models.TimeRelation.AFTER:
            result += shortened ? t("after") : ` ${t("after")}`;
            break;
        case models.TimeRelation.BETWEEN:
            if (!shortened) result += ` ${t("between")}`;
            break;
        case models.TimeRelation.AT:
            result += shortened ? t("at") : ` ${t("at")}`;
            break;
    }
    let connector = t("and");
    if (shortened && schedule.relation === models.TimeRelation.BETWEEN) {
        connector = t("to");
    }
    if (
        schedule.timePrimary &&
        schedule.relation !== models.TimeRelation.ANYTIME
    ) {
        if (shortened && schedule.relation === models.TimeRelation.BETWEEN) {
            result += `${moment(schedule.timePrimary).format("HH:mm")}`;
        } else {
            result += ` ${moment(schedule.timePrimary).format("HH:mm")}`;
        }
    }
    if (
        schedule.timeSecondary &&
        schedule.timePrimary &&
        schedule.relation === models.TimeRelation.BETWEEN
    ) {
        if (
            new Date(schedule.timeSecondary).getDate() !==
            new Date(schedule.timePrimary).getDate()
        ) {
            let timeSecondaryDayString = getDayString(schedule.timeSecondary);
            if (
                [t("today"), t("tomorrow"), t("yesterday")].includes(
                    timeSecondaryDayString
                )
            ) {
                timeSecondaryDayString = timeSecondaryDayString.toLowerCase();
            }

            const secondaryTimeString = moment(schedule.timeSecondary).format(
                "HH:mm"
            );
            result += ` ${connector} ${timeSecondaryDayString} ${t(
                "at"
            )} ${secondaryTimeString}`;
        } else {
            result += ` ${connector} ${moment(schedule.timeSecondary).format(
                "HH:mm"
            )}`;
        }
    }
    return result;
};

export default humanReadableScheduleString;
