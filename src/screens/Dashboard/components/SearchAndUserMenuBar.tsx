import * as React from "react";
import {
    NativeSyntheticEvent,
    TextInputChangeEventData,
    View,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import UserAvatar from "../../../components/UserAvatar";
import { setDashboardFilterTextboxValue } from "../../../redux/dashboardFilter/DashboardFilterActions";
import {
    dashboardFilterTextboxValueSelector,
    getWhoami,
} from "../../../redux/Selectors";
import LogoutDialog from "./LogoutDialog";

const SearchAndUserMenuBar = () => {
    const [logoutDialog, setLogoutDialog] = React.useState(false);
    const insets = useSafeAreaInsets();
    const currentFilter = useSelector(dashboardFilterTextboxValueSelector);
    const whoami = useSelector(getWhoami);
    const dispatch = useDispatch();
    const handleChange = (
        e: NativeSyntheticEvent<TextInputChangeEventData>
    ) => {
        const value = e.nativeEvent.text;
        dispatch(setDashboardFilterTextboxValue(value));
    };

    const handleClear = () => {
        dispatch(setDashboardFilterTextboxValue(""));
    };

    return (
        <View
            style={{
                flexDirection: "row",
                gap: 4,
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: insets.left + 16,
                paddingRight: insets.right + 16,
                paddingTop: insets.top,
            }}
        >
            <Searchbar
                onClearIconPress={handleClear}
                style={{ flex: 1 }}
                onChange={handleChange}
                value={currentFilter}
                placeholder="Filter..."
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