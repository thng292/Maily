import { Email } from "@/data/email/types"
import EmailDisplay from "./DisplayEmail"
import EmailList from "./EmailList"
import NavigationBar from "./NavigationBar"
import { useContext, useState } from "react"
import { Editor } from "./editor"
import { ConfigContext, MailBoxContext } from "@/data/provider"

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
