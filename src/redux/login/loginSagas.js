import { call, takeLatest } from "redux-saga/effects";
import { LOGOUT } from "./loginActions";
import { Auth, DataStore } from "aws-amplify";
import { GET_WHOAMI_FAILURE } from "../whoami/whoamiActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as clearOldData from "../../utilities/deleteOldAmplifyKeysFromAsyncStorage";

function* logout() {
    try {
        yield call([AsyncStorage, AsyncStorage.removeItem], "userTenantId");
        yield call([Auth, Auth.signOut]);
        yield call([DataStore, DataStore.stop]);
        yield call([DataStore, DataStore.clear]);
        // in case we have lingering data in RKStorage
        // this data might exist because of the change to the sqlite adapter
        yield call([
            clearOldData,
            clearOldData.deleteOldAmplifyKeysFromAsyncStorage,
        ]);
    } catch (error) {
        console.log(error);
    }
}

export function* watchLogout() {
    yield takeLatest(LOGOUT, logout);
}

export function* watchGetWhoamiFailure() {
    yield takeLatest(GET_WHOAMI_FAILURE, logout);
}
