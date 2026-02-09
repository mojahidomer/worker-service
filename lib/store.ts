import { configureStore } from "@reduxjs/toolkit";
import { workerRegistrationApi } from "./api/workerRegistrationApi";

export const store = configureStore({
  reducer: {
    [workerRegistrationApi.reducerPath]: workerRegistrationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(workerRegistrationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
