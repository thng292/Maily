import React from "react"

import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
} from "@mui/material"
import {
    Inbox,
    Send,
    Drafts,
    Create,
    RemoveCircle,
    Star,
} from "@mui/icons-material"
import NavigationItem from "./NavigationItem"

type Props = {
    selectedNavigation: string
    setSelectedNavigation: (value: string) => void
}

const navigationItems = [
    { key: "inbox", label: "Inbox", icon: <Inbox /> },
    { key: "important", label: "Important", icon: <Star /> },
    { key: "spam", label: "Spam", icon: <RemoveCircle /> },
]

const NavigationBar: React.FC<Props> = ({
    selectedNavigation,
    setSelectedNavigation,
}) => {
    return (
        <div className="flex flex-col">
            <Button startIcon={<Create />}>Compose</Button>
            <List component="nav">
                {navigationItems.map((item, ind) => (
                    <NavigationItem
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => setSelectedNavigation(item.key)}
                        selected={item.key == selectedNavigation}
                    ></NavigationItem>
                ))}
            </List>
        </div>
    )
}

export default NavigationBar
