import { ConfigContext, MailBoxContext } from "@/data/provider"
import { useContext, useEffect } from "react"
import { setupDB, SaveDB, TestBD } from "@/data/email/db"
import { POP3Wrapper, SMTPWrapper } from "@/socket"

function App() {
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    return (
        <div>
            <p>{JSON.stringify(mailBox)}</p>
            {JSON.stringify(config)}
            <input
                type="text"
                onChange={(e) => {
                    setConfig({ ...config, username: e.currentTarget.value })
                }}
            />
            <button
                onClick={async () => {
                    const pop3 = new POP3Wrapper()
                    await pop3
                        .connect("127.0.0.1", 3335)
                        .then(() => console.log("OK"))
                        .catch(console.error)

                    await pop3
                        .USER("fuck@fuck.fuck")
                        .then(() => console.log("OK"))
                        .catch(console.error)

                    await pop3
                        .PASS("sljf")
                        .then(() => console.log("OK"))
                        .catch(console.error)

                    await pop3.STAT().then(console.log).catch(console.error)
                    await pop3.UIDL().then(console.log).catch(console.error)
                    await pop3.RETR(1).then(console.log).catch(console.error)

                    await pop3.QUIT()
                    pop3.destroy()
                }}
            >
                Test POP3
            </button>
            <button
                onClick={async () => {
                    const SMTP = new SMTPWrapper()
                    await SMTP.send(
                        "127.0.0.1",
                        2225,
                        "anhvu@fuck.fuck",
                        ["fuck@fuck.fuck"],
                        "THis is a test",
                    )
                        .then(() => console.log("OK"))
                        .catch(console.error)
                }}
            >
                Test SMTP
            </button>
        </div>
    )
}

export default App
