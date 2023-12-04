import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material"
import { ReactElement } from "react"
type Props = {
    icon: ReactElement
    label: string
    selected: boolean
    onClick: () => void
}
const NavigationItem = ({ icon, label, onClick, selected }: Props) => {
    return (
        <ListItemButton
            selected={selected}
            onClick={onClick}
        >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
        </ListItemButton>
    )
}

export default NavigationItem
