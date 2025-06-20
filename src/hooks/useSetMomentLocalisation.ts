import * as React from "react";
import "moment/locale/fr";
import "moment/locale/es";
import "moment/locale/ja";
import "moment/locale/de";
import "moment/locale/en-gb";
import moment from "moment";
import { useTranslation } from "react-i18next";

const useSetMomentLocalization = () => {
    const { i18n } = useTranslation();
    React.useEffect(() => {
        if (i18n.language) {
            moment.locale(i18n.language);
        } else {
            moment.locale("en-GB");
        }
    }, [i18n.language]);
};

export default useSetMomentLocalization;
