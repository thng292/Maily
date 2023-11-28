import React, { useEffect, useState } from "react"
import { List, ListItem, ListItemText } from "@mui/material"
import { Email, FilteredMailBox } from "@/data/email/types"
import EmailItem from "./EmailItem"

interface Props {
    setDisplayEmail: (email: Email) => void
    mailList: Email[]
}

const EmailList: React.FC<Props> = ({ setDisplayEmail, mailList }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const emails: Email[] = [
        {
            id: 1,
            messageId: "abc123",
            uidl: "def456",
            replyTo: null,
            sentTime: new Date("2023-11-27T10:30:00Z"),
            sender: "johndoe@example.com",
            receiver: ["janedoe@example.com"],
            CC: [],
            subject: "Meeting Reminder",
            content: document.createElement("div"),
            attachment: [],
            read: false,
        },
        {
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
        },
    ]
    // const emails = mailList["inbox"]
    useEffect(() => {
        setDisplayEmail(emails[selectedIndex])
    }, [selectedIndex])

    return (
        <div>
            <List component="nav">
                {emails.map((email, index) => (
                    <EmailItem
                        email={email}
                        key={email.id}
                        index={index}
                        selectedIndex={selectedIndex}
                        setSelectedIndex={setSelectedIndex}
                    ></EmailItem>
                ))}
            </List>
        </div>
    )
}

export default EmailList
