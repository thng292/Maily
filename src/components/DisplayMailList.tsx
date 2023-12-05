import { List, ListItemButton, ListItemText } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Email } from "@/data/email"

export function DisplayMailList({
    mailList,
    setSelectedMail,
    largeScreen,
    display,
}: {
    mailList: Email[] | null
    setSelectedMail: React.Dispatch<React.SetStateAction<Email | null>>
    largeScreen: boolean
    display: boolean
}) {
    const theme = useTheme()
    if (display) {
        return (
            <div
                className="overflow-x-hidden flex flex-col flex-shrink-0"
                style={{
                    flexBasis: largeScreen ? "24rem" : "",
                    height: "100dvh",
                }}
            >
                <List>
                    {mailList?.map((val) => (
                        <ListItemButton
                            id={String(val.id)}
                            onClick={() => setSelectedMail(val)}
                        >
                            <ListItemText
                                primary={val.subject}
                                secondary={
                                    "From " + val.sender?.length
                                        ? val.sender
                                        : "Unknown Sender"
                                }
                            />
                        </ListItemButton>
                    ))}
                </List>
            </div>
        )
    } else {
        return <></>
    }
}
