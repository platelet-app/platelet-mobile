import * as awsHubSagas from "./awsHubListener/awsHubListenerSagas";
import { all, call } from "redux-saga/effects";
import {
    watchGetWhoami,
    watchInitWhoamiObserver,
    watchRefreshWhoami,
} from "./whoami/whoamiSagas";
import { watchGetWhoamiFailure, watchLogout } from "./login/loginSagas";
import {
    watchInitialiseApp,
    watchInitialWhoamiCompleted,
} from "./initialise/initialiseSagas";
import { watchDebounceDashboardFilter } from "./dashboardFilter/DashboardFilterSagas";
import {
    watchSelectAllItems,
    watchFilterFromAvailableItems,
} from "./selectionMode/selectionModeSagas";
import { watchInitializeTaskDeliverablesObserver } from "./taskDeliverables/taskDeliverablesSagas";
import { watchInitializeCommentsObserver } from "./comments/commentsSagas";

export default function* rootSaga() {
    yield all([
        call(awsHubSagas.watchInitialiseDataStoreListener),
        call(watchGetWhoami),
        call(watchRefreshWhoami),
        call(watchInitialiseApp),
        call(watchInitialWhoamiCompleted),
        call(watchDebounceDashboardFilter),
        call(watchSelectAllItems),
        call(watchFilterFromAvailableItems),
        call(watchInitWhoamiObserver),
        call(watchInitializeTaskDeliverablesObserver),
        call(watchInitializeCommentsObserver),
        call(watchLogout),
        call(watchGetWhoamiFailure),
    ]);
}
