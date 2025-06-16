import { Linking, View } from "react-native";
import { Text, TouchableRipple, IconButton } from "react-native-paper";
import Foundation from "@expo/vector-icons/Foundation";

type TelephoneProps = {
    telephoneNumber: string;
};

const Telephone: React.FC<TelephoneProps> = ({ telephoneNumber }) => {
    const handleOnPress = () => {
        const telStripped = telephoneNumber.replace(/\s/g, "");
        Linking.openURL(`tel:${telStripped}`);
    };
    return (
        <TouchableRipple onPress={handleOnPress}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <Text>
                    <Foundation name="telephone" size={24} />
                </Text>
                <Text>{telephoneNumber}</Text>
            </View>
        </TouchableRipple>
    );
};

export default Telephone;
