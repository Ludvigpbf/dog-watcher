import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@styles/App.css";
import Landing from "@views/Landing";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import store from "@redux/store.ts";
import NotFound from "@views/NotFound.tsx";

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
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);
