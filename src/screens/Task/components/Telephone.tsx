import { Linking, View } from "react-native";
import { Text, TouchableRipple, IconButton } from "react-native-paper";

type TelephoneProps = {
    telephoneNumber: string;
};

const Telephone: React.FC<TelephoneProps> = ({ telephoneNumber }) => {
    return (
        <TouchableRipple
            onPress={() => Linking.openURL(`tel:${telephoneNumber}`)}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <IconButton icon="phone" />
                <Text>{telephoneNumber}</Text>
            </View>
        </TouchableRipple>
    );
};

export default Telephone;
