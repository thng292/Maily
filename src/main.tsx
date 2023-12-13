import React, { ReactNode, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { DataProvider } from "@/data/provider"
import "./index.css"
import "@fontsource/inter"
import {
    createBrowserRouter,
    createHashRouter,
    RouterProvider,
} from "react-router-dom"
import { CssVarsProvider, StyledEngineProvider } from "@mui/joy/styles"
import FirstTime from "./screen/FirstTime"
import AppContainer from "./screen/AppContainer"
import { CssBaseline } from "@mui/joy"
import { FloodServer } from "./screen/FloodServer"

const router = createHashRouter([
    {
        path: "/",
        index: true,
        element: <AppContainer />,
    },
    {
        path: "firsttime",
        element: <FirstTime />,
    },
    {
        path: "flood",
        element: <FloodServer />,
    },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <DataProvider>
            <StyledEngineProvider injectFirst>
                <CssVarsProvider defaultMode="system">
                    <CssBaseline />
                    <RouterProvider router={router} />
                </CssVarsProvider>
            </StyledEngineProvider>
        </DataProvider>
    </React.StrictMode>,
)

postMessage({ payload: "removeLoading" }, "*")
