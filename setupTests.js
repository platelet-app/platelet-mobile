import MockAsyncStorage from "mock-async-storage";
import "@testing-library/jest-native/extend-expect";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";
import { load } from "@expo/env";
import path from "path";

// Load Expo environment variables from your project's root .env files
load(path.resolve(__dirname, "../"), { silent: true });

const mockImpl = new MockAsyncStorage();
jest.mock("@react-native-async-storage/async-storage", () => mockImpl);
jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
jest.mock("@sentry/react-native", () => ({
    init: jest.fn(),
    captureMessage: jest.fn(),
}));
jest.mock("@aws-amplify/datastore-storage-adapter/SQLiteAdapter", () => ({
    SQLiteAdapter: undefined,
}));

const RESET_MODULE_EXCEPTIONS = ["react", "react-redux"];

let mockActualRegistry = {};

RESET_MODULE_EXCEPTIONS.forEach((moduleName) => {
    jest.doMock(moduleName, () => {
        if (!mockActualRegistry[moduleName]) {
            mockActualRegistry[moduleName] = jest.requireActual(moduleName);
        }
        return mockActualRegistry[moduleName];
    });
});
