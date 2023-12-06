import { Email } from "@/data/email"
import {
    List,
    listItemButtonClasses,
    ListItem,
    ListItemButton,
    ListItemDecorator,
    Avatar,
    Box,
    Typography,
    ListDivider,
} from "@mui/joy"
import React from "react"

export default function EmailList({
    data,
    selected,
    onSelect,
}: {
    data?: Email[]
    selected?: Email
    onSelect: (mail: Email) => void
}) {
    return (
        <List
            sx={{
                [`& .${listItemButtonClasses.root}.${listItemButtonClasses.selected}`]:
                    {
                        borderLeft: "2px solid",
                        borderLeftColor:
                            "var(--joy-palette-primary-outlinedBorder)",
                    },
            }}
        >
            {data?.map((item, index) => (
                <React.Fragment key={index}>
                    <ListItem>
                        <ListItemButton
                            sx={{ p: 2 }}
                            selected={item.uidl == selected?.uidl}
                            onClick={() => onSelect(item)}
                        >
                            <div className="w-full">
                                <div className="flex justify-between w-full">
                                    <Typography
                                        level="body-xs"
                                        noWrap
                                        maxWidth={"60%"}
                                    >
                                        {item.sender}
                                    </Typography>
                                    <div className="flex items-center gap-2">
                                        {!item.read && (
                                            <Box
                                                sx={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "99px",
                                                    bgcolor: "Highlight",
                                                }}
                                            />
                                        )}
                                        <Typography
                                            level="body-xs"
                                            textColor="text.tertiary"
                                            noWrap
                                            textAlign={"right"}
                                        >
                                            {item.sentTime.toLocaleDateString()}
                                        </Typography>
                                    </div>
                                </div>
                                <Typography
                                    level="title-sm"
                                    sx={{ mb: 0.5 }}
                                    noWrap
                                    maxWidth={"80%"}
                                >
                                    {item.subject}
                                </Typography>
                            </div>
                        </ListItemButton>
                    </ListItem>
                    <ListDivider sx={{ m: 0 }} />
                </React.Fragment>
            ))}
        </List>
    )
}
