import { Button, Dialog, Portal } from "react-native-paper";
import { Text, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/login/loginActions";
import { useTranslation } from "react-i18next";

type LogoutDialogProps = {
    visible: boolean;
    onDismiss: () => void;
};

const LogoutDialog: React.FC<LogoutDialogProps> = ({ visible, onDismiss }) => {
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logoutUser());
    };
    const { colors } = useTheme();
    const { t } = useTranslation();
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{t("logOut")}</Dialog.Title>
                <Dialog.Content>
                    <Text>{t("doYouWantToLogOut")}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>{t("cancel")}</Button>
                    <Button textColor={colors.error} onPress={handleLogout}>
                        {t("logOut")}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default LogoutDialog;
