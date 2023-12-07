import { useContext, useEffect, useMemo, useState } from "react"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Navigate } from "react-router-dom"
import { Email } from "@/data/email"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import Navigation from "@/components/Navigation"
import MailList from "@/components/MailList"
import MailContent from "@/components/Mail"
import {
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Typography,
    Snackbar,
} from "@mui/joy"
import { useTheme } from "@mui/joy/styles"
import { Filter } from "@/data/config"
import EditFilter from "@/components/EditFilter"
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"

export default function EmailContent() {
    const theme = useTheme()
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const [selectedFilter, setSelectedFilter] = useState("Inbox")
    const [selectedMail, setSelectedMail] = useState<Email | undefined>(
        undefined,
    )
    const [editFilter, toggleEditFilter] = useState<Filter>()
    const filters = useMemo(() => Object.keys(mailBox.mailBox), [mailBox])

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
                    className="basis-48 flex flex-col flex-shrink-0 p-2"
                    style={{
                        height: "100dvh",
                    }}
                >
                    <Navigation
                        filter={filters}
                        currentFilter={selectedFilter}
                        setFilter={setSelectedFilter}
                        deleteFilter={(name) => {
                            setSelectedFilter("Inbox")
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
                    className="overflow-x-hidden flex flex-col flex-grow lg:flex-grow-0 lg:flex-shrink-0 lg:basis-96 relative"
                    style={{
                        height: "100dvh",
                    }}
                >
                    <div
                        className="p-4 flex justify-between items-baseline sticky top-0 z-50"
                        style={{
                            backgroundColor: theme.palette.background.surface,
                        }}
                    >
                        <p className="font-semibold text-2xl pb-1">
                            {selectedFilter}
                        </p>
                        <div className="flex gap-2">
                            <IconButton
                                disabled={mailBox.state == "loading"}
                                onClick={() =>
                                    dispatchMailBox({ action: "Refresh" })
                                }
                            >
                                {mailBox.state == "loading" ? (
                                    <CircularProgress
                                        size="sm"
                                        variant="soft"
                                    />
                                ) : (
                                    <CloudSyncOutlinedIcon />
                                )}
                            </IconButton>
                            <Button
                                variant="solid"
                                startDecorator={<CreateRoundedIcon />}
                            >
                                Compose
                            </Button>
                        </div>
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
                    className="flex flex-col lg:flex-1 overflow-auto"
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
                                        payload: selectedMail.uidl,
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
            <Snackbar
                open={mailBox.state == "failed"}
                color="danger"
                variant="soft"
                size="lg"
            >
                <div className="flex gap-2 items-center">
                    <ErrorOutlineOutlinedIcon />
                    <p>{mailBox.error}</p>
                </div>
            </Snackbar>
        </>
    )
}
