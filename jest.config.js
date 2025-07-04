module.exports = {
    projects: [
        {
            preset: "jest-expo/ios",
            setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
            transformIgnorePatterns: [
                "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
                "node_modules/(?!(@aws-amplify/ui-react|@aws-amplify/DataStore))/",
            ],
            moduleNameMapper: { "^uuid$": "uuid" },
            globalSetup: "./global-setup.js",
            transform: {
                "^.+\\.[jt]sx?$": [
                    "babel-jest",
                    { caller: { preserveEnvVars: true } },
                ],
            },
        },
        {
            preset: "jest-expo/android",
            setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
            transformIgnorePatterns: [
                "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
                "node_modules/(?!(@aws-amplify/ui-react|@aws-amplify/DataStore))/",
            ],
            moduleNameMapper: { "^uuid$": "uuid" },
            globalSetup: "./global-setup.js",
            transform: {
                "^.+\\.[jt]sx?$": [
                    "babel-jest",
                    { caller: { preserveEnvVars: true } },
                ],
            },
        },
    ],
};
