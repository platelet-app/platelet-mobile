import * as models from "../../models";
import { View } from "react-native";
import { Chip, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

type CommentVisibilityChipsProps = {
    value: models.CommentVisibility;
    onChange: (value: models.CommentVisibility) => void;
};

const CommentVisibilityChips: React.FC<CommentVisibilityChipsProps> = ({
    value,
    onChange,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {Object.values(models.CommentVisibility).map((visibility) => (
                <Chip
                    mode="outlined"
                    key={visibility}
                    selected={visibility === value}
                    selectedColor={colors.primary}
                    onPress={() => onChange(visibility)}
                >
                    {t(`commentVisibility.${visibility}`).toUpperCase()}
                </Chip>
            ))}
        </View>
    );
};

export default CommentVisibilityChips;
