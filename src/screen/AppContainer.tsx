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
import { Filter } from "@/data/config"
import EditFilter from "@/components/EditFilter"

export default function EmailContent() {
    const theme = useTheme()
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const [selectedFilter, setSelectedFilter] = useState("Inbox")
    const [selectedMail, setSelectedMail] = useState<Email | undefined>(
        undefined,
    )
    const [editFilter, toggleEditFilter] = useState<Filter>()
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
            <div
                className="flex flex-row gap-2 overflow-hidden"
                style={{
                    backgroundColor: theme.palette.background.surface,
                }}
            >
                <div
                    className="flex flex-col flex-shrink-0 p-2 basis-48"
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
                                old.filters.findIndex(
                                    (val) => val.name == name,
                                ),
                                1,
                            )
                            setConfig(old)
                        }}
                        editFilter={(name) => {
                            toggleEditFilter(
                                config.filters.find((val) => val.name == name),
                            )
                        }}
                    />
                </div>
                <Divider orientation="vertical"></Divider>
                <div
                    className="relative flex flex-col flex-grow overflow-x-hidden lg:flex-grow-0 lg:flex-shrink-0 lg:basis-96"
                    style={{
                        height: "100dvh",
                    }}
                >
                    <div
                        className="sticky top-0 z-50 flex items-baseline justify-between p-4"
                        style={{
                            backgroundColor: theme.palette.background.surface,
                        }}
                    >
                        <p className="pb-1 text-2xl font-semibold">
                            {selectedFilter}
                        </p>

                        <Button
                            variant="solid"
                            startDecorator={<CreateRoundedIcon />}
                            onClick={() => {}}
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
                    className="flex flex-col overflow-auto lg:flex-1"
                    style={{
                        height: "100dvh",
                    }}
                >
                    <div className="flex flex-grow">
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
            <EditFilter
                open={!!editFilter}
                onClose={() => toggleEditFilter(undefined)}
                setFilter={setSelectedFilter}
                filter={editFilter!}
            />
        </>
    )
}
