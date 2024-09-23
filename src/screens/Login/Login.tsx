import { useColorScheme } from "react-native";
import * as React from "react";
import {
    Authenticator,
    defaultDarkModeOverride,
    ThemeProvider,
} from "@aws-amplify/ui-react-native";
import LoginHeader from "./LoginHeader";
import { initialiseApp } from "../../redux/initialise/initialiseActions";
import { Auth, Hub } from "aws-amplify";
import { useDispatch, useSelector } from "react-redux";
import { getWhoami } from "../../redux/Selectors";

type LoginProps = {
    children: React.ReactNode;
    onChangeTeam?: () => void;
};

const Login: React.FC<LoginProps> = ({ children, onChangeTeam }) => {
    const colorMode = useColorScheme();
    const whoami = useSelector(getWhoami);

    const whoamiIsSet = !!whoami?.id;
    const hubListener = React.useRef<null | (() => void)>(null);
    const dispatch = useDispatch();
    const isInit = React.useRef(false);

    const initFunction = React.useCallback(async () => {
        if (isInit.current) return;
        const user = await Auth.currentAuthenticatedUser().catch(() => null);
        if (user) {
            dispatch(initialiseApp());
            isInit.current = true;
        } else {
            hubListener.current = Hub.listen("auth", async (hubData) => {
                if (hubData.payload.event === "signIn") {
                    dispatch(initialiseApp());
                    isInit.current = true;
                    if (hubListener.current)
                        Hub.remove("auth", hubListener.current);
                }
            });
        }
    }, [dispatch]);

    React.useEffect(() => {
        initFunction();
        return () => {
            if (hubListener.current) Hub.remove("auth", hubListener.current);
        };
    }, [initFunction]);

    const HeaderWithProps = React.useCallback(
        () => <LoginHeader onChangeTeam={onChangeTeam} />,
        [onChangeTeam]
    );

    const content = whoamiIsSet ? children : <></>;

    return (
        <ThemeProvider
            theme={{
                overrides: [defaultDarkModeOverride],
            }}
            colorMode={colorMode}
        >
            <Authenticator.Provider>
                <Authenticator
                    components={{
                        SignIn: (props) => (
                            <Authenticator.SignIn
                                {...props}
                                hideSignUp
                                Header={HeaderWithProps}
                            />
                        ),
                    }}
                    loginMechanisms={["email"]}
                >
                    {content}
                </Authenticator>
            </Authenticator.Provider>
        </ThemeProvider>
    );
};

export default Login;
