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
import FirstTime from "@/screen/FirstTime"
import {
    createTheme,
    CssBaseline,
    PaletteMode,
    ThemeProvider,
    useMediaQuery,
} from "@mui/material"
import AppContainer from "./screen/AppContainer"

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
            <ThemeWrapper>
                <RouterProvider router={router} />
            </ThemeWrapper>
        </DataProvider>
    </React.StrictMode>,
)

postMessage({ payload: "removeLoading" }, "*")

function ThemeWrapper({ children }: { children: ReactNode }) {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    // Update the theme only if the mode changes
    const theme = React.useMemo(
        () => createTheme(getDesignTokens(prefersDarkMode ? "dark" : "light")),
        [prefersDarkMode],
    )
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                  // palette values for light mode
                  primary: { main: "#000" },
                  divider: "#111",
              }
            : {
                  // palette values for dark mode
                  primary: { main: "#fff" },
                  divider: "#eee",
              }),
    },
})
