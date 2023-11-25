import { ConfigContext, MailBoxContext } from "@/data/provider"
import { useContext, useRef } from "react"
import { POP3Wrapper, SMTPWrapper } from "@/socket"
import { MailBuilder } from "@/data/email"

function App() {
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const thisComponent = useRef<HTMLDivElement>(null)
    return (
        <div>
            <p ref={thisComponent}>
                <strong>{JSON.stringify(mailBox)}</strong>
            </p>
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
            <button
                onClick={() => {
                    const mail = new MailBuilder()
                    mail.addSender("fuck@fuck.fuck")
                        .addCC(["anhvu@fuck.fuck"])
                        .addBCC(["nhatphuoc@fuck.fuck"])
                        .addSubject("this is a test")
                        .addContent(thisComponent.current!)
                        .addAttachment([
                            {
                                filename: "test.png",
                                mime: "image/png",
                                contentBase64: `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
AAAASUVORK5CYII=`,
                            },
                        ])
                    console.log(mail.toString())
                }}
            >
                Test Build Email
            </button>
        </div>
    )
}

export default App
