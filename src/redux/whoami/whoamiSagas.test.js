import { API, Auth, DataStore } from "aws-amplify";
import { testFunctions } from "./whoamiSagas";
import { runSaga } from "redux-saga";
import * as awsAmplify from "aws-amplify";
import * as models from "../../models";
import * as whoamiActions from "./whoamiActions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const fakeUser = {
    cognitoId: "someCognitoId",
    tenantId: "someTenantId",
    id: "someUserId",
};

const fakeCognitoResponse = {
    attributes: {
        sub: "someCognitoId",
    },
};

jest.mock("uuid", () => ({ v4: () => "someUUID" }));

describe("whoamiSagas", () => {
    beforeEach(() => {
        process.env.REACT_APP_DEMO_MODE = "false";
        process.env.REACT_APP_OFFLINE_ONLY = "false";
    });
    afterEach(async () => {
        jest.restoreAllMocks();
        await DataStore.clear();
    });
    it("get the user data from the API and save the tenantId", async () => {
        const dispatched = [];
        jest.spyOn(Auth, "currentAuthenticatedUser").mockResolvedValue(
            fakeCognitoResponse
        );
        jest.spyOn(API, "graphql").mockResolvedValue({
            data: { getUserByCognitoId: { items: [fakeUser] } },
        });
        jest.spyOn(AsyncStorage, "getItem").mockReturnValue(null);
        const setSpy = jest.spyOn(AsyncStorage, "setItem");
        const syncExpressionSpy = jest.spyOn(awsAmplify, "syncExpression");

        await runSaga(
            {
                dispatch: (action) => dispatched.push(action),
                getState: () => ({ state: "test" }),
            },
            testFunctions.getWhoami
        ).toPromise();

        expect(dispatched).toMatchSnapshot();
        expect(setSpy).toHaveBeenCalledWith("userTenantId", "someTenantId");
        for (const m of Object.values(models)) {
            if (!m.hasOwnProperty("copyOf")) continue;
            expect(syncExpressionSpy).toHaveBeenCalledWith(
                m,
                expect.any(Function)
            );
        }
    });
    it("get the user data from DataStore and the tenantId from localstorage", async () => {
        const dispatched = [];
        const mockWhoami = await DataStore.save(
            new models.User({
                displayName: "test",
                tenantId: "someTenant",
                cognitoId: "someCognitoId",
                username: "someUsername",
                roles: [models.Role.COORDINATOR],
            })
        );
        jest.spyOn(Auth, "currentAuthenticatedUser").mockResolvedValue(
            fakeCognitoResponse
        );
        jest.spyOn(API, "graphql").mockResolvedValue({
            data: { getUserByCognitoId: { items: [fakeUser] } },
        });
        jest.spyOn(AsyncStorage, "getItem").mockReturnValue("someTenantId");

        const apiSpy = jest.spyOn(API, "graphql").mockResolvedValue({});
        const setSpy = jest.spyOn(AsyncStorage, "setItem");
        const syncExpressionSpy = jest.spyOn(awsAmplify, "syncExpression");

        await runSaga(
            {
                dispatch: (action) => dispatched.push(action),
                getState: () => ({ state: "test" }),
            },
            testFunctions.getWhoami
        ).toPromise();

        const successAction = dispatched.find(
            (a) => a.type === whoamiActions.GET_WHOAMI_SUCCESS
        );
        expect(successAction.data).toEqual(mockWhoami);
        const initWhoamiObserverAction = dispatched.find(
            (a) => a.type === whoamiActions.INIT_WHOAMI_OBSERVER
        );
        expect(initWhoamiObserverAction).toEqual({
            type: whoamiActions.INIT_WHOAMI_OBSERVER,
            whoamiId: mockWhoami.id,
        });
        const filteredDispatched = dispatched.filter(
            (a) =>
                a.type !== whoamiActions.GET_WHOAMI_SUCCESS &&
                a.type !== whoamiActions.INIT_WHOAMI_OBSERVER
        );
        expect(filteredDispatched).toMatchSnapshot();
        expect(apiSpy).not.toHaveBeenCalled();
        expect(setSpy).not.toHaveBeenCalled();
        for (const m of Object.values(models)) {
            if (!m.hasOwnProperty("copyOf")) continue;
            expect(syncExpressionSpy).toHaveBeenCalledWith(
                m,
                expect.any(Function)
            );
        }
    });
    it("API failure", async () => {
        const dispatched = [];
        jest.spyOn(Auth, "currentAuthenticatedUser").mockResolvedValue(
            fakeCognitoResponse
        );
        jest.spyOn(API, "graphql").mockRejectedValue(new Error("someError"));
        jest.spyOn(AsyncStorage, "getItem").mockReturnValue(null);
        const setSpy = jest.spyOn(AsyncStorage, "setItem");

        await runSaga(
            {
                dispatch: (action) => dispatched.push(action),
                getState: () => ({ state: "test" }),
            },
            testFunctions.getWhoami
        ).toPromise();

        expect(dispatched).toMatchSnapshot();
        expect(setSpy).not.toHaveBeenCalled();
    });
    it("can't find the user", async () => {
        const dispatched = [];
        jest.spyOn(Auth, "currentAuthenticatedUser").mockResolvedValue(
            fakeCognitoResponse
        );
        jest.spyOn(API, "graphql").mockResolvedValue({
            data: { getUserByCognitoId: { items: [] } },
        });
        jest.spyOn(AsyncStorage, "getItem").mockReturnValue(null);

        await runSaga(
            {
                dispatch: (action) => dispatched.push(action),
                getState: () => ({ state: "test" }),
            },
            testFunctions.getWhoami
        ).toPromise();

        expect(dispatched).toMatchSnapshot();
    });
});
