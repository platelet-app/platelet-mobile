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
        // signOut listener (effect 2) is registered synchronously before the
        // signIn listener (initFunction, async) — wait for both
        await waitFor(() => {
            expect(hubSpy).toHaveBeenCalledTimes(2);
        });
        const hubListener = hubSpy.mock.calls[1][1];
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
    it("re-dispatches init app after signOut and re-login", async () => {
        const dispatch = jest.fn();
        jest.spyOn(redux, "useDispatch").mockReturnValue(dispatch);
        jest.spyOn(Auth, "currentAuthenticatedUser")
            .mockResolvedValueOnce({ username: "someUser" })
            .mockRejectedValue(new Error());
        const hubSpy = jest.spyOn(Hub, "listen").mockImplementation(() => () => {});
        render(
            <Login>
                <Text>test</Text>
            </Login>
        );
        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledWith(initialiseApp());
        });
        dispatch.mockClear();
        // effect 2 registers the signOut listener synchronously (call #0)
        await waitFor(() => {
            expect(hubSpy).toHaveBeenCalledWith("auth", expect.any(Function));
        });
        const signOutListener = hubSpy.mock.calls[0][1];
        signOutListener({ payload: { event: "signOut" } });
        // initFunction runs again, Auth rejects, signIn listener registered (call #1)
        await waitFor(() => {
            expect(hubSpy).toHaveBeenCalledTimes(2);
        });
        const signInListener = hubSpy.mock.calls[1][1];
        signInListener({ payload: { event: "signIn" } });
        expect(dispatch).toHaveBeenCalledWith(initialiseApp());
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
        // only the signOut listener is registered — no signIn listener needed
        expect(hubSpy).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("test")).toBeNull();
        store.dispatch(getWhoamiSuccess({ id: "someId" }));
        await screen.findByText("test");
    });
});
