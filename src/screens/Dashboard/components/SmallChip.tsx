import { Text } from "react-native-paper";
import { useColorScheme, View } from "react-native";

type SmallChipProps = {
    children: React.ReactNode;
    style: object;
};

const SmallChip: React.FC<SmallChipProps> = ({ children, style }) => {
    const theme = useColorScheme();
    return (
        <View
            style={{
                backgroundColor: theme === "dark" ? "#333" : "#eee",
                borderRadius: 30,
                padding: 6,
                height: 34,
                alignItems: "center",
                justifyContent: "center",
                ...style,
            }}
        >
            <Text numberOfLines={1} style={{ fontSize: 13, maxWidth: 130 }}>
                {children}
            </Text>
        </View>
    );
};

export default SmallChip;
