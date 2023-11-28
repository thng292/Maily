import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { DataProvider } from "@/data/provider"
import "./index.css"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import NavigationBar from "./components/NavigationBar"
import AppContainer from "./components/AppContainer"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <DataProvider>
            {/* <App /> */}
            <AppContainer></AppContainer>
        </DataProvider>
    </React.StrictMode>,
)

postMessage({ payload: "removeLoading" }, "*")
