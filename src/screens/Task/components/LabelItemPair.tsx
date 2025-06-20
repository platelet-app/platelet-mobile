import { Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    let text = item;
    if (!item && showUnset) {
        text = t("unset");
    }

    const handleOnPress = (telephoneNumber: string | null | undefined) => {
        if (telephoneNumber) {
            const telStripped = telephoneNumber.replace(/\s/g, "");
            Linking.openURL(`tel:${telStripped}`);
        }
    };
    const actualItem = tel ? (
        <Text
            style={{
                color: theme.dark ? "white" : "blue",
                textDecorationLine: "underline",
            }}
            onPress={() => handleOnPress(item)}
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
