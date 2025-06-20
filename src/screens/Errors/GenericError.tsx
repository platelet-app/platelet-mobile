import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

const GenericError = () => {
    const { t } = useTranslation();
    return <Text>{t("sorrySomethingWentWrong")}</Text>;
};

export default GenericError;
