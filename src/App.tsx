import { ConfigContext, MailBoxContext } from "@/data/provider"
import { useContext } from "react"
import { Email } from "@/data/email"
import { Navigate } from "react-router-dom"

function App() {
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    if (!config.validated) {
        return (
            <Navigate
                to="firsttime"
                replace
            />
        )
    }
    return (
        <>
            <p>Hello World!</p>
        </>
    )
}
export default App
