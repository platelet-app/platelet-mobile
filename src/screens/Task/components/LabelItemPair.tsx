import { Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import { Linking } from "react-native";

type LabelItemPairProps = {
    label: string;
    item?: string | null;
    showUnset?: boolean;
    tel?: boolean;
};

const LabelItemPair: React.FC<LabelItemPairProps> = ({
    label,
    item,
    showUnset = false,
    tel = false,
}) => {
    const theme = useTheme();
    let text = item;
    if (!item && showUnset) {
        text = "Unset";
    }
    const actualItem = tel ? (
        <Text
            style={{
                color: theme.dark ? "white" : "blue",
                textDecorationLine: "underline",
            }}
            onPress={() => Linking.openURL(`tel:${item}`)}
        >
            {text}
        </Text>
    ) : (
        <Text
            selectable
            style={{
                fontStyle: item ? "normal" : "italic",
            }}
        >
            {text}
        </Text>
    );
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <Text>{label}: </Text>
            {actualItem}
        </View>
    );
};

export default LabelItemPair;
