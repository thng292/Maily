import React, { useState } from "react"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import InboxRoundedIcon from "@mui/icons-material/InboxRounded"
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"

import {
    Box,
    IconButton,
    List,
    ListSubheader,
    ListItem,
    ListItemButton,
    ListItemDecorator,
    ListItemContent,
    Divider,
} from "@mui/joy"
import Settings from "./Setting"
import AddFilter from "./AddFilter"

export default function Navigation({
    filter,
    setFilter,
    currentFilter,
    deleteFilter,
}: {
    filter: string[]
    setFilter: React.Dispatch<React.SetStateAction<string>>
    deleteFilter: (filterName: string) => void
    currentFilter: string
}) {
    const [openSetting, toggleSettingModal] = useState(false)
    const [openFilter, toggleFilterModal] = useState(false)
    return (
        <>
            <List
                size="sm"
                sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}
            >
                <ListItem nested>
                    <ListSubheader
                        sx={{ letterSpacing: "2px", fontWeight: "800" }}
                    >
                        Browse"
                    </ListSubheader>
                    <List aria-labelledby="nav-list-browse">
                        <ListItem>
                            <ListItemButton
                                selected={currentFilter == "Inbox"}
                                onClick={() => setFilter("Inbox")}
                            >
                                <ListItemDecorator>
                                    <InboxRoundedIcon fontSize="small" />
                                </ListItemDecorator>
                                <ListItemContent>Inbox</ListItemContent>
                            </ListItemButton>
                        </ListItem>
                        <ListItem>
                            <ListItemButton
                                selected={currentFilter == "Sent"}
                                onClick={() => setFilter("Sent")}
                            >
                                <ListItemDecorator>
                                    <OutboxRoundedIcon fontSize="small" />
                                </ListItemDecorator>
                                <ListItemContent>Sent</ListItemContent>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </ListItem>
                <ListItem
                    nested
                    sx={{ mt: 2 }}
                >
                    <ListSubheader
                        sx={{
                            letterSpacing: "2px",
                            fontWeight: "800",
                        }}
                    >
                        <div className="flex flex-row justify-between items-center w-full">
                            Filters
                            <IconButton
                                onClick={() => toggleFilterModal(true)}
                                size="sm"
                            >
                                <AddRoundedIcon />
                            </IconButton>
                        </div>
                    </ListSubheader>
                    <List
                        aria-labelledby="nav-list-tags"
                        size="sm"
                        sx={{
                            "--ListItemDecorator-size": "32px",
                        }}
                    >
                        {filter
                            .filter((val) => val != "Inbox" && val != "Sent")
                            .map((val) => (
                                <ListItem>
                                    <ListItemButton
                                        selected={currentFilter == val}
                                        onClick={() => setFilter(val)}
                                    >
                                        <ListItemDecorator>
                                            <Box
                                                sx={{
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius: "99px",
                                                    bgcolor: "primary.500",
                                                }}
                                            />
                                        </ListItemDecorator>
                                        <ListItemContent>{val}</ListItemContent>
                                        <div className="flex-1"></div>
                                        <ListItemDecorator>
                                            <IconButton
                                                size={"sm"}
                                                color="danger"
                                                onClick={() => {
                                                    deleteFilter(val)
                                                }}
                                            >
                                                <DeleteRoundedIcon />
                                            </IconButton>
                                        </ListItemDecorator>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                    </List>
                </ListItem>
                <ListItemButton onClick={() => toggleSettingModal(true)}>
                    <SettingsOutlinedIcon></SettingsOutlinedIcon>
                    Setting
                </ListItemButton>
            </List>
            <Settings
                open={openSetting}
                onClose={() => toggleSettingModal(false)}
            />
            <AddFilter
                open={openFilter}
                onClose={() => toggleFilterModal(false)}
            ></AddFilter>
        </>
    )
}
