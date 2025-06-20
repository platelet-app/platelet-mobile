import * as models from "../models";

const taskStatusHumanReadable = (
    t: (key: string) => string,
    status: models.TaskStatus | null | undefined
) => {
    if (!status) {
        return "";
    }
    return t(`status.${status}`).toUpperCase();
};

export default taskStatusHumanReadable;
