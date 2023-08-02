import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import * as React from "react";
import * as models from "../../models";
import { useColorScheme, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { ResolvedComment } from "../../hooks/useComments";
import { getWhoami } from "../../redux/Selectors";
import CommentAuthor from "./CommentAuthor";

type CommentItemProps = {
    comment: ResolvedComment;
    showAuthor?: boolean;
};

const CommentItem: React.FC<CommentItemProps> = ({ comment, showAuthor }) => {
    const { author, body, createdAt, visibility } = comment;
    const whoami = useSelector(getWhoami);
    const isSelf = whoami?.id === author?.id;
    const editCount = comment._version ? comment._version - 1 : 0;
    const colorScheme = useColorScheme();
    const alignSelf = isSelf ? "flex-end" : "flex-start";
    const isPrivate = visibility === models.CommentVisibility.ME;

    return (
        <View>
            {author && showAuthor && (
                <CommentAuthor isSelf={isSelf} user={author} />
            )}
            <Card
                style={{
                    maxWidth: "90%",
                    alignSelf,
                }}
                mode={isPrivate ? "contained" : "elevated"}
            >
                <Card.Content>
                    <Text>{body}</Text>
                </Card.Content>
                <View
                    style={{
                        gap: 4,
                        alignSelf,
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: 8,
                        marginBottom: 8,
                        marginRight: 8,
                    }}
                >
                    {createdAt && (
                        <Text
                            style={{
                                fontSize: 12,
                                fontStyle: "italic",
                                opacity: 0.3,
                            }}
                        >
                            {moment(createdAt).calendar()}
                        </Text>
                    )}
                    {editCount > 0 && (
                        <MaterialIcons
                            name="edit"
                            color={
                                colorScheme === "dark" ? "#bebebe" : "#bfbdc2"
                            }
                        />
                    )}
                    {isPrivate && (
                        <MaterialIcons
                            name="lock"
                            color={
                                colorScheme === "dark" ? "#ff8787" : "#940000"
                            }
                        />
                    )}
                </View>
            </Card>
        </View>
    );
};

export default CommentItem;