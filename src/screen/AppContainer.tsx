import { Email } from "@/data/email/types"
import EmailDisplay from "../components/DisplayEmail"
import EmailList from "../components/EmailList"
import NavigationBar from "../components/NavigationBar"
import { useContext, useState } from "react"
import { Editor } from "../components/editor"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import { Navigate } from "react-router-dom"

const emptyMail: Email = {
    id: 2,
    messageId: "ghi789",
    uidl: "jkl012",
    replyTo: "johndoe@example.com",
    sentTime: new Date("2023-11-26T14:45:00Z"),
    sender: "janedoe@example.com",
    receiver: ["johndoe@example.com"],
    CC: ["bob@example.com"],
    subject: "Project Update",
    content: document.createElement("div"),
    attachment: [],
    read: true,
}

const AppContainer = () => {
    const [displayEmail, setDisplayEmail] = useState<Email>()
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const [selectedNavigation, setSelectedNavigation] = useState("inbox")
    if (!config.validated) {
        return (
            <Navigate
                to="firsttime"
                replace
            />
        )
    }
    return (
        <div className="flex w-screen h-screen">
            <NavigationBar
                selectedNavigation={selectedNavigation}
                setSelectedNavigation={setSelectedNavigation}
            ></NavigationBar>
            <EmailList
                setDisplayEmail={setDisplayEmail}
                mailList={mailBox.mailBox[selectedNavigation]}
            ></EmailList>
            <EmailDisplay displayEmail={displayEmail}></EmailDisplay>
            {/* <Editor></Editor> */}
        </div>
    )
}

export default AppContainer
