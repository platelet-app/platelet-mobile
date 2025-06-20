import * as React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { Text } from "react-native-paper";

type PersonProps = {
    name: string;
};

const Person: React.FC<PersonProps> = ({ name }) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
            }}
        >
            <Text>
                <Ionicons name="person" size={24} />
            </Text>
            <Text>{name}</Text>
        </View>
    );
};

export default Person;
