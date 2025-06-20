import * as React from "react";
import { StatusBar } from "expo-status-bar";
import "@azure/core-asynciterator-polyfill";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import Dashboard from "./src/screens/Dashboard/Dashboard";
import Task from "./src/screens/Task/Task";
import { store } from "./src/redux";
import { Provider } from "react-redux";
import { Logger } from "aws-amplify";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { useColorScheme, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DashboardHeader from "./src/screens/Dashboard/components/DashboardHeader";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TenantListProvider from "./src/screens/TenantPicker/TenantListProvider";
import Login from "./src/screens/Login/Login";
import * as _ from "lodash";
import * as Sentry from "@sentry/react-native";
import "./src/i18n";
import useSetMomentLocalization from "./src/hooks/useSetMomentLocalisation";
import { useTranslation } from "react-i18next";

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        debug: process.env.EXPO_PUBLIC_SENTRY_DEBUG_MODE === "true",
    });
}

declare global {
    namespace ReactNavigation {
        interface RootParamList {
            Home: undefined;
            Task: { taskId: string };
            NotFound: undefined;
        }
    }
}
const Tab = createMaterialBottomTabNavigator();

registerTranslation("en-GB", enGB);

Logger.LOG_LEVEL = "ERROR";

const Stack = createNativeStackNavigator();

declare global {
    namespace ReactNativePaper {
        interface ThemeColors {
            shimmerForeground: string;
            shimmerBackground: string;
            NEW: string;
            ACTIVE: string;
            PICKED_UP: string;
            DROPPED_OFF: string;
            COMPLETED: string;
            CANCELLED: string;
            ABANDONED: string;
            REJECTED: string;
            PENDING: string;
        }
    }
}

const lightTheme = {
    colors: {
        shimmerForeground: "#ecebeb",
        shimmerBackground: "#f3f3f3",
        NEW: "rgba(252, 231, 121, 1)",
        ACTIVE: "#8fb7ff",
        PICKED_UP: "#ffc252",
        DROPPED_OFF: "#15d615",
        COMPLETED: "#b8ffb8",
        CANCELLED: "#8f8fff",
        ABANDONED: "#ff8787",
        REJECTED: "#adadad",
        PENDING: "lightblue",
    },
};

const darkTheme = {
    colors: {
        shimmerForeground: "#333",
        shimmerBackground: "#555",
        NEW: "rgba(252, 231, 121, 1)",
        ACTIVE: "#3e5d94",
        PICKED_UP: "#946000",
        DROPPED_OFF: "#004d00",
        COMPLETED: "#4d804d",
        CANCELLED: "#0000a8",
        ABANDONED: "#940000",
        REJECTED: "#4d4d4d",
        PENDING: "lightblue",
    },
};

const darkThemeMerged = _.merge(MD3DarkTheme, darkTheme);
const lightThemeMerged = _.merge(MD3LightTheme, lightTheme);

const InProgress = () => {
    return <Dashboard tabIndex={0} status="inProgress" />;
};

const Completed = () => {
    return <Dashboard tabIndex={1} status="completed" />;
};

function InProgressStack() {
    const { t } = useTranslation();
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerTitleStyle: { fontWeight: "bold" },
            }}
        >
            <Stack.Screen
                name="Home"
                component={InProgress}
                options={{
                    header: () => <DashboardHeader tabIndex={0} />,
                    title: t("home"),
                }}
            />
            <Stack.Screen
                name="Task"
                component={Task}
                options={{ title: t("task") }}
            />
        </Stack.Navigator>
    );
}
function CompletedStack() {
    const { t } = useTranslation();
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerTitleStyle: { fontWeight: "bold" },
            }}
        >
            <Stack.Screen
                name="Home"
                component={Completed}
                options={{
                    header: () => <DashboardHeader tabIndex={1} />,
                    title: t("home"),
                }}
            />
            <Stack.Screen
                name="Task"
                component={Task}
                options={{ title: t("task") }}
            />
        </Stack.Navigator>
    );
}

const Main = () => {
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    return (
        <NavigationContainer
            theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <StatusBar translucent backgroundColor="transparent" />
            <KeyboardAvoidingView
                enabled={Platform.OS === "ios"}
                behavior="padding"
                style={{ flex: 1 }}
            >
                <Tab.Navigator initialRouteName="InProgressStack">
                    <Tab.Screen
                        name="InProgressStack"
                        component={InProgressStack}
                        options={{
                            tabBarIcon: "compass-outline",
                            tabBarLabel: t("inProgress"),
                        }}
                    />
                    <Tab.Screen
                        name="CompletedStack"
                        component={CompletedStack}
                        options={{
                            tabBarIcon: "check-circle-outline",
                            tabBarLabel: t("completed"),
                        }}
                    />
                </Tab.Navigator>
            </KeyboardAvoidingView>
        </NavigationContainer>
    );
};

const App = () => {
    const colorScheme = useColorScheme();
    const [tenantProviderKey, setTenantProviderKey] = React.useState(false);
    useSetMomentLocalization();

    return (
        <SafeAreaProvider>
            <PaperProvider
                theme={
                    colorScheme === "dark" ? darkThemeMerged : lightThemeMerged
                }
            >
                <TenantListProvider
                    key={
                        tenantProviderKey
                            ? "tenant-list-provider-1"
                            : "tenant-list-provider-2"
                    }
                >
                    <Provider store={store}>
                        <Login
                            onChangeTeam={() => {
                                setTenantProviderKey(!tenantProviderKey);
                            }}
                        >
                            <Main />
                        </Login>
                    </Provider>
                </TenantListProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
};

export default Sentry.wrap(App);
