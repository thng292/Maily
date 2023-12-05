import { useContext, useState } from "react"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import { Navigate } from "react-router-dom"
import {
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
} from "@mui/material"
import InboxIcon from "@mui/icons-material/Inbox"
import SendIcon from "@mui/icons-material/Send"
import AddIcon from "@mui/icons-material/Add"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"
import { useTheme } from "@mui/material/styles"
import { Email } from "@/data/email"
import { DisplayMail } from "../components/DisplayMail"
import { DisplayMailList } from "../components/DisplayMailList"

const AppContainer = () => {
    const theme = useTheme()
    const largeScreen = useMediaQuery("(min-width: 1280px)")
    console.log(largeScreen)
    const [config, setConfig] = useContext(ConfigContext)
    const [mailBox, dispatchMailBox] = useContext(MailBoxContext)
    const [selectedFilter, setSelectedFilter] = useState("Inbox")
    const [selectedMail, setSelectedMail] = useState<Email | null>(null)
    if (!config.validated) {
        return (
            <Navigate
                to="firsttime"
                replace
            />
        )
    }
    return (
        <div className="flex flex-row overflow-hidden">
            <div
                className="basis-48 flex flex-col flex-shrink-0"
                style={{
                    height: "100dvh",
                }}
            >
                <List dense>
                    <ListItem>
                        <Button
                            onClick={() => setSelectedFilter("")}
                            endIcon={<AddIcon />}
                            variant="outlined"
                        >
                            Compose
                        </Button>
                    </ListItem>

                    <ListItemButton
                        selected={
                            selectedFilter == "Inbox" || selectedFilter == ""
                        }
                        onClick={() => setSelectedFilter("Inbox")}
                    >
                        <ListItemIcon>
                            <InboxIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Inbox"} />
                    </ListItemButton>
                    <ListItemButton
                        selected={selectedFilter == "Sent"}
                        onClick={() => setSelectedFilter("Sent")}
                    >
                        <ListItemIcon>
                            <SendIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Sent"} />
                    </ListItemButton>
                </List>
                <List>
                    <ListItem>
                        <Button
                            endIcon={<AddIcon />}
                            onClick={() => {}}
                            variant="outlined"
                        >
                            Add Filter
                        </Button>
                    </ListItem>

                    {Object.keys(mailBox.mailBox)
                        .filter((val) => val != "Inbox" && val != "Sent")
                        .map((val) => (
                            <ListItemButton
                                id={val}
                                selected={selectedFilter == val}
                                onClick={() => setSelectedFilter(val)}
                            >
                                <ListItemIcon>
                                    <FolderOpenIcon></FolderOpenIcon>
                                </ListItemIcon>
                                <ListItemText primary={val} />
                            </ListItemButton>
                        ))}
                </List>
            </div>
            <DisplayMailList
                mailList={
                    mailBox.mailBox[
                        selectedFilter.length ? selectedFilter : "Inbox"
                    ]
                }
                largeScreen={largeScreen}
                setSelectedMail={setSelectedMail}
                display={largeScreen || !selectedMail}
            />

            <DisplayMail
                mail={selectedMail}
                close={() => setSelectedMail(null)}
            />
        </div>
    )
}

export default AppContainer
