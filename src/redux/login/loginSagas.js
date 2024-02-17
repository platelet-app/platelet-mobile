import { call, takeLatest } from "redux-saga/effects";
import { LOGOUT } from "./loginActions";
import { Auth, DataStore } from "aws-amplify";
import { GET_WHOAMI_FAILURE } from "../whoami/whoamiActions";
import AsyncStorage from "@react-native-async-storage/async-storage";

function* logout() {
    try {
        yield call([AsyncStorage, AsyncStorage.removeItem], "userTenantId");
        yield call([Auth, Auth.signOut]);
        yield call([DataStore, DataStore.stop]);
        yield call([DataStore, DataStore.clear]);
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
