import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@styles/App.css";
import Landing from "@views/Landing";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import store from "@redux/store.ts";
import NotFound from "@views/NotFound.tsx";
import { registerSW } from "virtual:pwa-register";
import Feed from "@views/Feed.tsx";
import "@locales/i18n.tsx";
import NewAudio from "@components/NewAudio.tsx";

const updateSW = registerSW({
  onNeedRefresh() {
    // Notify user about the update
    console.log("New content available, please refresh.");
  },
  onOfflineReady() {
    // Notify user that app is ready to work offline
    console.log("App is ready to work offline.");
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Provider store={store}>
          <App />
        </Provider>
      </>
    ),
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "/feed",
        element: <Feed />,
      },
      {
        path: "/new-audio",
        element: <NewAudio />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);

updateSW();
