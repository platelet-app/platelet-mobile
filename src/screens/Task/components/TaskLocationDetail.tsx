import React from "react";
import * as models from "../../../models";
import { Text, Card, TouchableRipple, Divider } from "react-native-paper";
import useModelSubscription from "../../../hooks/useModelSubscription";
import LabelItemPair from "./LabelItemPair";
import DividerWithBottomMargin from "../../../components/DividerWithBottomMargin";

type TaskLocationDetailProps = {
    locationId: string | null;
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

const TaskLocationDetail: React.FC<TaskLocationDetailProps> = ({
    locationId,
    title,
}) => {
    const [showHidden, setShowHidden] = React.useState(false);
    const { state, isFetching, error } = useModelSubscription<models.Location>(
        models.Location,
        locationId || undefined
    );
    const hiddenFields = ["line2", "line3", "county", "town", "country"];
    const wholeAddress = React.useMemo(
        () =>
            Object.keys(fields).reduce((acc, key) => {
                const value = state?.[key as keyof TaskLocationDetailFields];
                if (value && acc) {
                    return `${acc}
${value}`;
                } else if (value) {
                    return value;
                } else {
                    return acc;
                }
            }, ""),
        [state]
    );
    return (
        <Card>
            <Card.Title title={title} />
            <DividerWithBottomMargin />
            <Card.Content style={{ gap: 8 }}>
                {showHidden && (
                    <Text style={{ textAlign: "right" }} selectable>
                        {wholeAddress}
                    </Text>
                )}
                <TouchableRipple
                    onPress={() => {
                        setShowHidden(true);
                    }}
                >
                    <>
                        {Object.entries(fields).map(([key, label]) => {
                            if (!showHidden && hiddenFields.includes(key)) {
                                return null;
                            } else if (!showHidden) {
                                return (
                                    <LabelItemPair
                                        key={key}
                                        label={label}
                                        item={
                                            state?.[
                                                key as keyof TaskLocationDetailFields
                                            ]
                                        }
                                    />
                                );
                            } else {
                                return null;
                            }
                        })}
                        {Object.entries(contactFields).map(([key, label]) => (
                            <LabelItemPair
                                key={key}
                                label={label}
                                item={
                                    state?.contact?.[
                                        key as keyof TaskContactDetailFields
                                    ]
                                }
                            />
                        ))}
                    </>
                </TouchableRipple>
            </Card.Content>
            <Divider
                style={{ marginTop: 8, width: "90%", alignSelf: "center" }}
            />
            <Text
                variant="bodyLarge"
                style={{
                    padding: 8,
                    textDecorationLine: "underline",
                    fontStyle: "italic",
                    alignSelf: "flex-end",
                }}
                onPress={() => setShowHidden((prevState) => !prevState)}
            >
                {showHidden ? "See less" : "See more"}
            </Text>
        </Card>
    );
};

export default TaskLocationDetail;