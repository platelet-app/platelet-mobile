import * as React from "react";
import {
    NativeSyntheticEvent,
    TextInput,
    TextInputChangeEventData,
    View,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import UserAvatar from "../../../components/UserAvatar";
import { setDashboardFilterTextboxValue } from "../../../redux/dashboardFilter/DashboardFilterActions";
import {
    dashboardFilterTextboxValueSelector,
    getWhoami,
} from "../../../redux/Selectors";
import LogoutDialog from "./LogoutDialog";

type SearchAndUserMenuBarProps = {
    style?: React.CSSProperties;
};

const SearchAndUserMenuBar: React.FC<SearchAndUserMenuBarProps> = ({
    style = {},
}) => {
    const [logoutDialog, setLogoutDialog] = React.useState(false);
    const currentFilter = useSelector(dashboardFilterTextboxValueSelector);
    const whoami = useSelector(getWhoami);
    const dispatch = useDispatch();
    const handleChange = (
        e: NativeSyntheticEvent<TextInputChangeEventData>
    ) => {
        const { text } = e.nativeEvent;
        dispatch(setDashboardFilterTextboxValue(text));
    };

    const handleClear = () => {
        dispatch(setDashboardFilterTextboxValue(""));
    };
    const ref = React.useRef<TextInput | null>(null);

    return (
        <View
            style={{
                flexDirection: "row",
                gap: 4,
                height: 50,
                alignItems: "center",
                justifyContent: "space-between",
                ...style,
            }}
        >
            <Searchbar
                onClearIconPress={handleClear}
                style={{ flex: 1 }}
                onChange={handleChange}
                value={currentFilter}
                placeholder="Filter..."
                onIconPress={() => {
                    if (ref.current) ref.current.focus();
                }}
                ref={ref}
            />
            <UserAvatar
                onPress={() => setLogoutDialog(true)}
                size={50}
                user={whoami}
            />
            <LogoutDialog
                visible={logoutDialog}
                onDismiss={() => setLogoutDialog(false)}
            />
        </View>
    );
};

export default SearchAndUserMenuBar;
