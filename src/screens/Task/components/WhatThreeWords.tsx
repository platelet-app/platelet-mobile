import * as React from "react";
import { Linking, View } from "react-native";
import { TouchableRipple, useTheme, Text } from "react-native-paper";
import Svg, { SvgProps, Defs, G, Path } from "react-native-svg";

const Logo = (props: SvgProps) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 146.273 146.273"
        {...props}
    >
        <Defs></Defs>
        <G id="Layer_2" data-name="Layer 2">
            <G id="artwork">
                <Path
                    d="M117.02 29.252H29.256v87.766h87.766V29.252Z"
                    style={{
                        fill: "#e11f26",
                    }}
                />
                <Path
                    d="M67.653 92.335a2.745 2.745 0 0 1-2.603-3.61l10.971-32.913a2.743 2.743 0 0 1 5.204 1.736L70.255 90.46a2.743 2.743 0 0 1-2.602 1.875ZM51.197 92.335a2.746 2.746 0 0 1-2.603-3.61l10.971-32.913a2.743 2.743 0 0 1 5.204 1.736L53.8 90.46a2.743 2.743 0 0 1-2.602 1.875ZM84.109 92.335a2.746 2.746 0 0 1-2.602-3.61l10.97-32.913a2.743 2.743 0 0 1 5.204 1.736L86.711 90.46a2.743 2.743 0 0 1-2.602 1.875Z"
                    style={{
                        fill: "#fff",
                    }}
                />
                <Path
                    d="M0 0h146.273v146.273H0z"
                    style={{
                        fill: "none",
                    }}
                />
            </G>
        </G>
    </Svg>
);

type WhatThreeWordsProps = {
    what3words: string;
};

const WhatThreeWords: React.FC<WhatThreeWordsProps> = ({ what3words }) => {
    return (
        <TouchableRipple
            onPress={() =>
                Linking.openURL(`https://what3words.com/${what3words}`)
            }
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <Logo width={40} height={40} />
                <Text>{what3words}</Text>
            </View>
        </TouchableRipple>
    );
};

export default WhatThreeWords;
