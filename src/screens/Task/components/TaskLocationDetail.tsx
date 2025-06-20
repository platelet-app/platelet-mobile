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
import DividerWithBottomMargin from "../../../components/DividerWithBottomMargin";
import ContentLoader, { Rect } from "react-content-loader/native";
import GenericError from "../../Errors/GenericError";
import WhatThreeWords from "./WhatThreeWords";
import Telephone from "./Telephone";
import ScheduleDetails from "./ScheduleDetails";
import Person from "./Person";
import { useTranslation } from "react-i18next";

type TaskLocationDetailProps = {
    locationId?: string | null;
    title: string;
    schedule?: models.Schedule | null;
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

const CardWrapper = ({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) => {
    return (
        <Card mode="outlined">
            <Card.Title title={title} />
            <DividerWithBottomMargin />
            {children}
        </Card>
    );
};

const TaskLocationDetail: React.FC<TaskLocationDetailProps> = ({
    locationId,
    title,
    schedule,
}) => {
    const { state, isFetching, error } = useModelSubscription<models.Location>(
        models.Location,
        locationId
    );
    const { colors, dark } = useTheme();
    const { t } = useTranslation();

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
            <CardWrapper title={t(title)}>
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
            <CardWrapper title={t(title)}>
                <Card.Content>
                    <Text>No location set.</Text>
                </Card.Content>
            </CardWrapper>
        );
    } else {
        return (
            <CardWrapper title={t(title)}>
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
                        <>
                            <Divider
                                style={{
                                    width: "100%",
                                    alignSelf: "center",
                                }}
                            />
                            <WhatThreeWords what3words={state.what3words} />
                        </>
                    )}
                    {(state?.contact?.name ||
                        state?.contact?.telephoneNumber) && (
                        <Divider
                            style={{
                                marginTop: 8,
                                width: "100%",
                                alignSelf: "center",
                            }}
                        />
                    )}
                    <View
                        style={{
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {state?.contact?.name && (
                            <Person name={state.contact.name} />
                        )}
                        {state?.contact?.telephoneNumber && (
                            <Telephone
                                telephoneNumber={state.contact.telephoneNumber!}
                            />
                        )}
                    </View>
                    {schedule && (
                        <Divider
                            style={{
                                marginTop: 8,
                                width: "100%",
                                alignSelf: "center",
                            }}
                        />
                    )}
                    <ScheduleDetails schedule={schedule} />
                </Card.Content>
            </CardWrapper>
        );
    }
};

export default TaskLocationDetail;
