import { Button, Dialog, Portal } from "react-native-paper";
import { Text, useTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/login/loginActions";

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
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Log out</Dialog.Title>
                <Dialog.Content>
                    <Text>Do you want to log out?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button textColor={colors.error} onPress={handleLogout}>
                        Log out
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default LogoutDialog;
