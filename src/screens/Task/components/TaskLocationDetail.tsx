import * as React from "react";
import { Linking, Platform, View } from "react-native";
import * as models from "../../../models";
import {
    Text,
    Card,
    TouchableRipple,
    Divider,
    useTheme,
} from "react-native-paper";
import useModelSubscription from "../../../hooks/useModelSubscription";
import LabelItemPair from "./LabelItemPair";
import DividerWithBottomMargin from "../../../components/DividerWithBottomMargin";
import ContentLoader, { Rect } from "react-content-loader/native";
import GenericError from "../../Errors/GenericError";
import W3wIcon from "../../../assets/w3w_Symbol_RGB_Red.svg";

type TaskLocationDetailProps = {
    locationId?: string | null;
    title: string;
};

type TaskLocationDetailFields = {
    ward?: string | null;
    line1?: string | null;
    line2?: string | null;
    line3?: string | null;
    town?: string | null;
    county?: string | null;
    state?: string | null;
    country?: string | null;
    postcode?: string | null;
    what3words?: string | null;
};

type TaskContactDetailFields = {
    name?: string | null;
    telephoneNumber?: string | null;
};

const fields = {
    ward: "Ward",
    line1: "Line one",
    line2: "Line two",
    line3: "Line three",
    town: "Town",
    county: "County",
    country: "Country",
    postcode: "Postcode",
};

const contactFields = {
    name: "Name",
    telephoneNumber: "Telephone",
};

const CardWrapper = ({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) => {
    return (
        <Card>
            <Card.Title title={title} />
            <DividerWithBottomMargin />
            {children}
        </Card>
    );
};

const TaskLocationDetail: React.FC<TaskLocationDetailProps> = ({
    locationId,
    title,
}) => {
    const { state, isFetching, error } = useModelSubscription<models.Location>(
        models.Location,
        locationId
    );
    const { colors, dark } = useTheme();

    const addressString = !state
        ? ""
        : Object.keys(fields)
              .filter((v) => !["what3words"].includes(v))
              .map((key) => state[key as keyof TaskLocationDetailFields])
              .filter((v) => v)
              .join(", ");
    const mapsUrl = Platform.select({
        ios: `maps://0,0?q=${addressString}`,
        android: `geo:0,0?q=${addressString}`,
    });
    if (error) {
        return <GenericError />;
    } else if (isFetching) {
        return (
            <CardWrapper title={title}>
                <Card.Content>
                    <ContentLoader
                        testID="task-location-skeleton"
                        speed={2}
                        width="100%"
                        height={100}
                        viewBox="0 0 400 100"
                        backgroundColor={colors.shimmerBackground}
                        foregroundColor={colors.shimmerForeground}
                    >
                        <Rect
                            x="0"
                            y="0"
                            rx="0"
                            ry="0"
                            width="400"
                            height="20"
                        />
                        <Rect
                            x="0"
                            y="22"
                            rx="0"
                            ry="0"
                            width="400"
                            height="20"
                        />
                        <Rect
                            x="0"
                            y="44"
                            rx="0"
                            ry="0"
                            width="400"
                            height="20"
                        />
                        <Rect
                            x="0"
                            y="66"
                            rx="0"
                            ry="0"
                            width="400"
                            height="20"
                        />
                        <Rect
                            x="0"
                            y="88"
                            rx="0"
                            ry="0"
                            width="400"
                            height="20"
                        />
                    </ContentLoader>
                </Card.Content>
            </CardWrapper>
        );
    } else if (state === null) {
        return (
            <CardWrapper title={title}>
                <Card.Content>
                    <Text>No location set.</Text>
                </Card.Content>
            </CardWrapper>
        );
    } else {
        return (
            <CardWrapper title={title}>
                <Card.Content style={{ gap: 8 }}>
                    <TouchableRipple
                        onLongPress={() => {}}
                        onPress={() => mapsUrl && Linking.openURL(mapsUrl)}
                    >
                        <View style={{ gap: 8 }}>
                            <Text style={{ fontWeight: "bold" }}>
                                {state?.name}
                            </Text>
                            <Text selectable>{addressString}</Text>
                        </View>
                    </TouchableRipple>
                    {state?.what3words && (
                        <TouchableRipple
                            onPress={() =>
                                Linking.openURL(
                                    `https://what3words.com/${state.what3words}`
                                )
                            }
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 4,
                                }}
                            >
                                <Text
                                    style={{
                                        color: dark ? "white" : "blue",
                                        textDecorationLine: "underline",
                                    }}
                                >
                                    {state?.what3words}
                                </Text>
                                <W3wIcon width={20} height={20} />
                            </View>
                        </TouchableRipple>
                    )}
                    {(state?.contact?.name ||
                        state?.contact?.telephoneNumber) && (
                        <Divider
                            style={{
                                marginTop: 8,
                                width: "90%",
                                alignSelf: "center",
                            }}
                        />
                    )}
                    <View>
                        {Object.entries(contactFields).map(
                            ([key, label]) =>
                                state?.contact?.[
                                    key as keyof TaskContactDetailFields
                                ] && (
                                    <LabelItemPair
                                        key={key}
                                        label={label}
                                        tel={key === "telephoneNumber"}
                                        item={
                                            state?.contact?.[
                                                key as keyof TaskContactDetailFields
                                            ]
                                        }
                                    />
                                )
                        )}
                    </View>
                </Card.Content>
            </CardWrapper>
        );
    }
};

export default TaskLocationDetail;
