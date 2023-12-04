import { ConfigContext, MailBoxContext } from "@/data/provider"
import { useContext } from "react"
import { Email } from "@/data/email"
import { Navigate } from "react-router-dom"

function gogo(mails: Email[]) {
    console.log(mails)
    return (
        <div>
            {mails.map((val) => (
                <div id={val.uidl}>{val.subject}</div>
            ))}
        </div>
    )
}

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
