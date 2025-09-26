import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Finds and deletes all key-value pairs from AsyncStorage
 * where the key starts with the AWS Amplify DataStore prefix.
 */
export const deleteOldAmplifyKeysFromAsyncStorage = async () => {
    const prefix = "@AmplifyDatastore";
    try {
        // 1. Get all keys currently in AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();

        // 2. Filter the keys to find only those that start with the prefix
        const keysToDelete = allKeys.filter((key) => key.startsWith(prefix));

        // 3. If any matching keys were found, remove them
        if (keysToDelete.length > 0) {
            console.log(
                `Found ${keysToDelete.length} Amplify items to delete.`
            );
            await AsyncStorage.multiRemove(keysToDelete);
            console.log("Successfully deleted Amplify data from AsyncStorage.");
        } else {
            console.log("No Amplify data found in AsyncStorage to delete.");
        }
    } catch (error) {
        console.error("Error clearing Amplify data from AsyncStorage:", error);
    }
};
