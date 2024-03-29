import * as React from "react";
import clearAmplifyConfig from "../../utilities/clearAmplifyConfig";
import configureAmplify from "./utilities/configureAmplify";
import saveAmplifyConfig from "../../utilities/saveAmplifyConfig";
import TenantList from "./components/TenantList";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataStore } from "aws-amplify";
import * as SplashScreen from "expo-splash-screen";
import { DAYS_AGO } from "../../hooks/utilities/getTasksConsts";

export const DAYS_TO_WAIT_BEFORE_CLEARING_DATA = DAYS_AGO;

SplashScreen.preventAutoHideAsync();

type TenantListProviderProps = {
    children?: React.ReactNode;
};

const log = (...args: string[]) => {
    console.log("[TenantListProvider]:", ...args);
};

export const TenantListProvider: React.FC<TenantListProviderProps> = ({
    children,
}) => {
    const [isProcessing, setIsProcessing] = React.useState(true);
    const [showList, setShowList] = React.useState(false);

    const handleListSetup = React.useCallback(() => {
        setShowList(false);
        setIsProcessing(false);
    }, []);

    const setup = React.useCallback(async () => {
        setIsProcessing(true);
        const lastSynced = await AsyncStorage.getItem("dateLastSynced");
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - DAYS_TO_WAIT_BEFORE_CLEARING_DATA);
        if (lastSynced && new Date(lastSynced) < daysAgo) {
            console.log(
                `more than ${DAYS_TO_WAIT_BEFORE_CLEARING_DATA} days since last sync, clearing stale data from DataStore`
            );
            await DataStore.clear();
        }
        try {
            const tenantId = await AsyncStorage.getItem("tenantId");
            if (tenantId) {
                log(`tenantId: ${tenantId}`);
                const config = await saveAmplifyConfig(tenantId, 3000);
                configureAmplify(config);
                setIsProcessing(false);
            } else {
                setShowList(true);
                setIsProcessing(false);
            }
        } catch (error) {
            // my test fails if this comment isn't here..
            if (error instanceof Error) {
                log("couldn't get tenant info", error.message);
            }
            await clearAmplifyConfig();
            setShowList(true);
            setIsProcessing(false);
        }
    }, []);

    React.useEffect(() => {
        setup();
    }, [setup]);

    const onLayoutRootView = async () => {
        if (!isProcessing) {
            // This tells the splash screen to hide immediately! If we call this after
            // `setAppIsReady`, then we may see a blank screen while the app is
            // loading its initial state and rendering its first pixels. So instead,
            // we hide the splash screen once we know the root view has already
            // performed layout.
            await SplashScreen.hideAsync();
        }
    };

    if (isProcessing) {
        return null;
    } else if (showList) {
        return (
            <View
                testID="tenant-list"
                height="100%"
                width="100%"
                onLayout={onLayoutRootView}
            >
                <TenantList onComplete={handleListSetup} />
            </View>
        );
    } else {
        return (
            <View height="100%" width="100%" onLayout={onLayoutRootView}>
                {children}
            </View>
        );
    }
};

export default TenantListProvider;
