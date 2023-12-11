import { useContext, useEffect, useMemo, useState } from "react"
import CreateRoundedIcon from "@mui/icons-material/CreateRounded"
import { Navigate } from "react-router-dom"
import { AllFilter } from "@/data/email"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import Navigation from "@/components/Navigation"
import MailList from "@/components/MailList"
import MailContent from "@/components/Mail"
import {
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Snackbar,
} from "@mui/joy"
import { useTheme } from "@mui/joy/styles"
import { Filter } from "@/data/config"
import EditFilter from "@/components/EditFilter"
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import WriteEmail from "@/components/WriteEmail"

export default function EmailContent() {
    const theme = useTheme()
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const [editFilter, toggleEditFilter] = useState<Filter>()
    const filters = useMemo(
        () => config.filters.map((val) => val.name),
        [config],
    )
    const [open, setOpen] = useState(false)
    const [isReply, setIsReply] = useState(false)
    const [isForward, setIsForward] = useState(false)

    useEffect(() => {
        console.log(mailBox)
    }, [mailBox])

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
                        filter={filters}
                        currentFilter={mailBox.currentFilter.name}
                        setFilter={(name) => {
                            const newFilter = config.filters.find(
                                (value) => value.name == name,
                            )
                            dispatchMailBox({
                                action: "Get",
                                filter: newFilter ?? ({ name } as AllFilter),
                            })
                        }}
                        deleteFilter={(name) => {
                            dispatchMailBox({
                                action: "Get",
                                filter: { name: "Inbox" },
                            })
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
                            {mailBox.currentFilter.name}
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
                                onClick={() => setOpen(true)}
                            >
                                Compose
                            </Button>
                        </div>
                    </div>
                    <MailList
                        data={mailBox.mailBox}
                        selected={mailBox.currentMail}
                        onMore={() => dispatchMailBox({ action: "More" })}
                        onSelect={(mail) => {
                            let action2 = "GetEmail"
                            if (mailBox.currentFilter.name == "Sent") {
                                action2 = "GetSentEmail"
                            }
                            if (!mail.read) {
                                dispatchMailBox({
                                    action: "Read",
                                    id: mail.id,
                                }).then(() =>
                                    dispatchMailBox({
                                        action: action2 as any,
                                        id: mail.id,
                                    }),
                                )
                            } else {
                                dispatchMailBox({
                                    action: action2 as any,
                                    id: mail.id,
                                })
                            }
                        }}
                    />

                    <WriteEmail
                        open={open}
                        isReply={isReply}
                        isForward={isForward}
                        mail={mailBox.currentMail}
                        onClose={() => {
                            setOpen(false)
                            setIsReply(false)
                            setIsForward(false)
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
                            mail={mailBox.currentMail}
                            replyMail={() => {
                                setIsReply(true)
                                setOpen(true)
                                setIsForward(false)
                            }}
                            deleteMail={() => {
                                if (!mailBox.currentMail) {
                                    return
                                }
                                if (mailBox.currentMail.uidl.length) {
                                    dispatchMailBox({
                                        action: "Delete",
                                        id: mailBox.currentMail.id,
                                    })
                                } else {
                                    dispatchMailBox({
                                        action: "DeleteSend",
                                        id: mailBox.currentMail.id,
                                    })
                                }
                            }}
                            forwardMail={() => {
                                setIsForward(true)
                                setOpen(true)
                                setIsReply(false)
                            }}
                        />
                    </div>
                </div>
            </div>
            <EditFilter
                open={!!editFilter}
                onClose={() => toggleEditFilter(undefined)}
                setFilter={(name) =>
                    dispatchMailBox({
                        action: "Get",
                        filter: config.filters.find((val) => val.name == name),
                    })
                }
                filter={editFilter!}
            />
            <Snackbar
                open={mailBox.state == "failed"}
                color="danger"
                variant="soft"
                size="lg"
            >
                <div className="flex items-center gap-2">
                    <ErrorOutlineOutlinedIcon />
                    <p>{mailBox.error}</p>
                </div>
            </Snackbar>
        </>
    )
}
