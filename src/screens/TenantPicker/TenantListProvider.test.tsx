import TenantListProvider from "./TenantListProvider";
import { Amplify } from "aws-amplify";
import { fireEvent, render, screen, waitFor } from "../../test-utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

const fakeConfigData = `{"test":"test"}`;
const fakeAmplifyConfig = {
    someData: "someValue",
    another: "value",
};

jest.mock(
    "../../aws-exports",
    () => {
        return {
            default: fakeAmplifyConfig,
        };
    },
    { virtual: true }
);

describe("TenantListProvider", () => {
    const OLD_ENV = process.env;

    beforeEach(async () => {
        jest.resetModules();
        jest.restoreAllMocks();
        await AsyncStorage.clear();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });
    it("lists the tenants", async () => {
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            new URL("http://localhost:4000/graphql")
        );
        const fakeItems = [
            { id: 1, name: "Tenant 1" },
            { id: 2, name: "Tenant 2" },
        ];
        jest.spyOn(global, "fetch").mockResolvedValue({
            json: () =>
                Promise.resolve({
                    data: { listTenants: { items: fakeItems } },
                }),
        });
        render(
            <TenantListProvider>
                <></>
            </TenantListProvider>
        );
        await screen.findByText("Tenant 1");
        await screen.findByText("Tenant 2");
    });

    it("failure while listing the tenants", async () => {
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            "http://localhost:4000/graphql"
        );
        const querySpy = jest
            .spyOn(global, "fetch")
            .mockRejectedValue(new Error());
        render(
            <TenantListProvider>
                <></>
            </TenantListProvider>
        );
        await waitFor(() => {
            expect(querySpy).toHaveBeenCalled();
        });
        screen.getByText(
            "There was an error while retrieving the available teams."
        );
    });

    test("clicking and configuring a tenant", async () => {
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            "http://localhost:4000/graphql"
        );
        const fakeItems = [
            { id: "someId", name: "Tenant 1" },
            { id: "someId2", name: "Tenant 2" },
        ];
        const amplifySpy = jest.spyOn(Amplify, "configure");
        const querySpy = jest
            .spyOn(global, "fetch")
            .mockResolvedValueOnce({
                json: () =>
                    Promise.resolve({
                        data: { listTenants: { items: fakeItems } },
                    }),
            })
            .mockResolvedValueOnce(
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            data: {
                                getTenant: {
                                    id: "someId",
                                    name: "Tenant 1",
                                    config: fakeConfigData,
                                    version: "1",
                                },
                            },
                        }),
                })
            );
        const localStorageSpy = jest.spyOn(AsyncStorage, "setItem");
        render(
            <TenantListProvider>
                <>test</>
            </TenantListProvider>
        );
        await waitFor(() => {
            expect(querySpy).toHaveBeenCalled();
        });
        expect(screen.queryByText("test")).toBeNull();
        const tenantItem = screen.getByText("Tenant 1");
        fireEvent(tenantItem, "onPress");
        await waitFor(() => {
            expect(querySpy).toHaveBeenCalledTimes(2);
        });
        const parsedConfig = JSON.parse(fakeConfigData);
        await waitFor(() => {
            expect(amplifySpy).toHaveBeenCalledWith(parsedConfig);
        });
        expect(localStorageSpy).toHaveBeenCalledWith(
            "amplifyConfig",
            fakeConfigData
        );
        expect(localStorageSpy).toHaveBeenCalledWith("tenantName", "Tenant 1");
        expect(localStorageSpy).toHaveBeenCalledWith("tenantVersion", "1");
        expect(localStorageSpy).toHaveBeenCalledWith("tenantId", "someId");
        screen.getByText("test");
    });

    test("configuring with an existing config", async () => {
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            "http://localhost:4000/graphql"
        );
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce({
                json: () =>
                    Promise.resolve({
                        data: { listTenants: { items: [] } },
                    }),
            })
            .mockResolvedValue(
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            data: {
                                getTenant: {
                                    id: "someId",
                                    name: "Tenant 1",
                                    config: fakeConfigData,
                                    version: "1",
                                },
                            },
                        }),
                })
            );
        const localStorageSetSpy = jest.spyOn(AsyncStorage, "setItem");
        const amplifySpy = jest.spyOn(Amplify, "configure");
        const localStorageSpy = jest
            .spyOn(AsyncStorage, "getItem")
            .mockReturnValueOnce("1")
            .mockReturnValue(fakeConfigData);
        render(<TenantListProvider>test</TenantListProvider>);
        expect(screen.queryByText("test")).toBeNull();
        await waitFor(() => {
            expect(localStorageSpy).toHaveBeenCalled();
        });
        const parsedConfig = JSON.parse(fakeConfigData);
        await waitFor(() => {
            expect(amplifySpy).toHaveBeenCalledWith(parsedConfig);
        });
        expect(localStorageSetSpy).not.toHaveBeenCalledWith(
            "tenantVersion",
            "2"
        );
        expect(localStorageSetSpy).not.toHaveBeenCalledWith(
            "tenantName",
            "Tenant 1"
        );
        expect(localStorageSetSpy).not.toHaveBeenCalledWith(
            "amplifyConfig",
            fakeConfigData
        );
        screen.getByText("test");
    });

    test("configuring with an existing config, but graphql fails", async () => {
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            "http://localhost:4000/graphql"
        );
        jest.spyOn(global, "fetch").mockRejectedValue(new Error());
        const localStorageSetSpy = jest.spyOn(AsyncStorage, "setItem");
        const amplifySpy = jest.spyOn(Amplify, "configure");
        const localStorageSpy = jest
            .spyOn(AsyncStorage, "getItem")
            .mockReturnValueOnce("1")
            .mockReturnValue(fakeConfigData);
        render(<TenantListProvider>test</TenantListProvider>);
        expect(screen.queryByText("test")).toBeNull();
        await waitFor(() => {
            expect(localStorageSpy).toHaveBeenCalled();
        });
        const parsedConfig = JSON.parse(fakeConfigData);
        await waitFor(() => {
            expect(amplifySpy).toHaveBeenCalledWith(parsedConfig);
        });
        expect(localStorageSetSpy).not.toHaveBeenCalledWith(
            "tenantVersion",
            "2"
        );
        expect(localStorageSetSpy).not.toHaveBeenCalledWith(
            "tenantName",
            "Tenant 1"
        );
        expect(localStorageSetSpy).not.toHaveBeenCalledWith(
            "amplifyConfig",
            fakeConfigData
        );
        screen.getByText("test");
    });

    test("configuring with an existing config, but it doesn't exist", async () => {
        const fakeItems = [{ id: "someId", name: "Tenant 1" }];
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            "http://localhost:4000/graphql"
        );
        jest.spyOn(global, "fetch")
            .mockRejectedValueOnce(new Error())
            .mockResolvedValueOnce({
                json: () =>
                    Promise.resolve({
                        data: { listTenants: { items: fakeItems } },
                    }),
            });
        const localStorageRemoveSpy = jest.spyOn(AsyncStorage, "removeItem");
        const amplifySpy = jest.spyOn(Amplify, "configure");
        const localStorageSpy = jest
            .spyOn(AsyncStorage, "getItem")
            .mockReturnValueOnce("1")
            .mockReturnValue(undefined);
        render(<TenantListProvider>test</TenantListProvider>);
        expect(screen.queryByText("test")).toBeNull();
        await waitFor(() => {
            expect(localStorageSpy).toHaveBeenCalledTimes(2);
        });
        expect(amplifySpy).not.toHaveBeenCalled();
        expect(localStorageRemoveSpy).toHaveBeenCalledWith("tenantVersion");
        expect(localStorageRemoveSpy).toHaveBeenCalledWith("tenantName");
        expect(localStorageRemoveSpy).toHaveBeenCalledWith("amplifyConfig");
        await screen.findByText("Tenant 1");
    });

    test("update the config when it is out of date", async () => {
        process.env["REACT_APP_TENANT_GRAPHQL_ENDPOINT"] = new URL(
            "http://localhost:4000/graphql"
        );
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            data: {
                                getTenant: {
                                    id: "someId",
                                    name: "Tenant 1",
                                    config: fakeConfigData,
                                    version: "2",
                                },
                            },
                        }),
                })
            )
            .mockResolvedValue({
                json: () =>
                    Promise.resolve({
                        data: { listTenants: { items: [] } },
                    }),
            });
        const amplifySpy = jest.spyOn(Amplify, "configure");
        const localStorageSpy = jest
            .spyOn(AsyncStorage, "getItem")
            .mockReturnValueOnce("someId")
            .mockReturnValueOnce("1")
            .mockReturnValue(fakeConfigData);
        const localStorageSetSpy = jest.spyOn(AsyncStorage, "setItem");
        render(<TenantListProvider>test</TenantListProvider>);
        expect(screen.queryByText("test")).toBeNull();
        await waitFor(() => {
            expect(localStorageSpy).toHaveBeenCalled();
        });
        const parsedConfig = JSON.parse(fakeConfigData);
        await waitFor(() => {
            expect(amplifySpy).toHaveBeenCalledWith(parsedConfig);
        });
        expect(localStorageSetSpy).toHaveBeenCalledWith("tenantVersion", "2");
        expect(localStorageSetSpy).toHaveBeenCalledWith(
            "tenantName",
            "Tenant 1"
        );
        expect(localStorageSetSpy).toHaveBeenCalledWith(
            "amplifyConfig",
            fakeConfigData
        );
        screen.getByText("test");
    });
});