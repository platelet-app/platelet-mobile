import * as React from "react";
import { Platform, Keyboard, KeyboardEvent } from "react-native";

const useKeyboardHeight = () => {
    const [keyboardHeight, setKeyboardHeight] = React.useState(0);

    React.useEffect(() => {
        if (Platform.OS === "ios") {
            const showSubscription = Keyboard.addListener(
                "keyboardDidShow",
                (e: KeyboardEvent) => {
                    setKeyboardHeight(e.endCoordinates.height);
                }
            );
            const hideSubscription = Keyboard.addListener(
                "keyboardDidHide",
                () => {
                    setKeyboardHeight(0);
                }
            );

            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }
    }, []);

    return keyboardHeight;
};

export default useKeyboardHeight;
