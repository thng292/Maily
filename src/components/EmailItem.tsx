import { Email } from "@/data/email/types"
import { ListItem, ListItemButton, ListItemText } from "@mui/material"

interface Props {
    email: Email
    index: number
    selectedIndex: number
    setSelectedIndex: (index: number) => void
}

const EmailItem = ({
    email,
    index,
    selectedIndex,
    setSelectedIndex,
}: Props) => {
    return (
        <ListItemButton
            selected={index == selectedIndex}
            onClick={() => setSelectedIndex(index)}
        >
            <ListItemText
                primary={email.sender}
                secondary={email.subject}
            />
        </ListItemButton>
    )
}

export default EmailItem
