import MockAsyncStorage from "mock-async-storage";
import "@testing-library/jest-native/extend-expect";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

const mockImpl = new MockAsyncStorage();
jest.mock("@react-native-async-storage/async-storage", () => mockImpl);
jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
jest.mock("@sentry/react-native", () => ({
    init: jest.fn(),
    captureMessage: jest.fn(),
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
