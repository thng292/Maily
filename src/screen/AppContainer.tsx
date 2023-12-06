import { useContext, useState } from "react"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Navigate } from "react-router-dom"
import { Email } from "@/data/email"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import Navigation from "@/components/Navigation"
import MailList from "@/components/MailList"
import MailContent from "@/components/Mail"
import { Button, Divider, Typography } from "@mui/joy"
import { useTheme } from "@mui/joy/styles"

export default function EmailContent() {
    const theme = useTheme()
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const [selectedFilter, setSelectedFilter] = useState("Inbox")
    const [selectedMail, setSelectedMail] = useState<Email | undefined>(
        undefined,
    )
    console.log("From main", mailBox)
    if (!config.validated) {
        return (
            <Navigate
                to="firsttime"
                replace
            />
        )
    }
    return (
        <div
            className="flex flex-row gap-2 overflow-hidden"
            style={{
                backgroundColor: theme.palette.background.surface,
            }}
        >
            <div
                className="basis-48 flex flex-col flex-shrink-0 p-2"
                style={{
                    height: "100dvh",
                }}
            >
                <Navigation
                    filter={Object.keys(mailBox.mailBox)}
                    currentFilter={selectedFilter}
                    setFilter={setSelectedFilter}
                    deleteFilter={(name) => {
                        const old = structuredClone(config)
                        old.filters.splice(
                            old.filters.findIndex((val) => val.name == name),
                            1,
                        )
                        setConfig(old)
                    }}
                />
            </div>
            <Divider orientation="vertical"></Divider>
            <div
                className="overflow-x-hidden flex flex-col lg:flex-shrink-0 lg:basis-96 relative"
                style={{
                    height: "100dvh",
                }}
            >
                <div
                    className="p-4 flex justify-between items-center sticky top-0 z-50"
                    style={{
                        backgroundColor: theme.palette.background.surface,
                    }}
                >
                    <p className="font-semibold text-2xl pb-1">
                        {selectedFilter}
                    </p>

                    <Button
                        variant="solid"
                        startDecorator={<CreateRoundedIcon />}
                    >
                        Compose
                    </Button>
                </div>
                <MailList
                    data={mailBox.mailBox[selectedFilter]}
                    selected={selectedMail}
                    onSelect={(mail) => {
                        if (!mail.read) {
                            dispatchMailBox({
                                action: "Read",
                                payload: mail.uidl,
                            })
                        }
                        setSelectedMail(mail)
                    }}
                />
            </div>
            <div
                className="flex flex-col flex-1 overflow-auto"
                style={{
                    height: "100dvh",
                }}
            >
                <div className="flex-grow flex">
                    <MailContent
                        mail={selectedMail}
                        replyMail={() => {}}
                        deleteMail={() => {
                            if (selectedMail) {
                                dispatchMailBox({
                                    action: "Delete",
                                    payload: selectedMail.id,
                                })
                            }
                        }}
                        forwardMail={() => {}}
                    />
                </div>
            </div>
        </div>
    )
}
