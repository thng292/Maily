import React, { ReactNode, useEffect } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { DataProvider } from "@/data/provider"
import "./index.css"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import FirstTime from "./FirstTime"
import {
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    useMediaQuery,
} from "@mui/material"

const router = createBrowserRouter([
    {
        path: "/",
        index: true,
        element: <AppContainer />,
    },
    {
        path: "firsttime",
        element: <FirstTime />,
    },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <DataProvider>
            <App />
        </DataProvider>
    </React.StrictMode>,
)

postMessage({ payload: "removeLoading" }, "*")
