import { render, screen, waitFor } from "../../test-utils";
import Login from "./Login";
import { Auth, Hub } from "aws-amplify";
import * as redux from "react-redux";
import { initialiseApp } from "../../redux/initialise/initialiseActions";
import { getWhoamiSuccess } from "../../redux/whoami/whoamiActions";
import { Text } from "react-native";

jest.mock("@aws-amplify/ui-react-native", () => {
    const ThemeProvider = ({ children }) => <>{children}</>;
    const Authenticator = ({ children }) => <>{children}</>;
    Authenticator.Provider = ({ children }) => <>{children}</>;
    return { ThemeProvider, Authenticator };
});

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useDispatch: jest.fn(),
}));

describe("Login", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    it("dispatches init app on login", async () => {
        const dispatch = jest.fn();
        jest.spyOn(redux, "useDispatch").mockReturnValue(dispatch);
        jest.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(() => {
            return Promise.reject();
        });
        const hubSpy = jest.spyOn(Hub, "listen").mockImplementation(() => {
            return () => {};
        });
        const hubRemoveSpy = jest.spyOn(Hub, "remove");
        const { store } = render(
            <Login>
                <Text>test</Text>
            </Login>
        );
        await waitFor(() => {
            expect(hubSpy).toHaveBeenCalledWith("auth", expect.any(Function));
        });
        const hubListener = hubSpy.mock.calls[0][1];
        hubListener({ payload: { event: "signIn" } });
        expect(dispatch).toHaveBeenCalledWith(initialiseApp());
        expect(screen.queryByText("test")).toBeNull();
        store.dispatch(getWhoamiSuccess({ id: "someId" }));
        await screen.findByText("test");
        expect(hubRemoveSpy).toHaveBeenCalledWith("auth", expect.any(Function));
    });
    it("unsubscribe from listener on unmount", async () => {
        const dispatch = jest.fn();
        jest.spyOn(redux, "useDispatch").mockReturnValue(dispatch);
        jest.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(() => {
            return Promise.reject();
        });
        const hubSpy = jest.spyOn(Hub, "listen").mockImplementation(() => {
            return () => {};
        });
        const hubRemoveSpy = jest.spyOn(Hub, "remove");
        const { component } = render(
            <Login>
                <Text>test</Text>
            </Login>
        );
        await waitFor(() => {
            expect(hubSpy).toHaveBeenCalledWith("auth", expect.any(Function));
        });
        component.unmount();
        expect(hubRemoveSpy).toHaveBeenCalledWith("auth", expect.any(Function));
    });
    it("dispatches init app if the user is logged in", async () => {
        const dispatch = jest.fn();
        jest.spyOn(redux, "useDispatch").mockReturnValue(dispatch);
        jest.spyOn(Auth, "currentAuthenticatedUser").mockImplementation(() => {
            return Promise.resolve({ username: "someUser" });
        });
        const hubSpy = jest.spyOn(Hub, "listen").mockImplementation(() => {
            return () => {};
        });
        const { store } = render(
            <Login>
                <Text>test</Text>
            </Login>
        );
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledWith(initialiseApp());
        });
        expect(screen.queryByText("test")).toBeNull();
        store.dispatch(getWhoamiSuccess({ id: "someId" }));
        await screen.findByText("test");
        expect(hubSpy).not.toHaveBeenCalledWith("auth", expect.any(Function));
    });
});
