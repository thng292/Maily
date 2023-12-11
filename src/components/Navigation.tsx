import { useState } from "react"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import InboxRoundedIcon from "@mui/icons-material/InboxRounded"
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"
import AllInboxIcon from "@mui/icons-material/AllInbox"
import {
    Box,
    IconButton,
    List,
    ListSubheader,
    ListItem,
    ListItemButton,
    ListItemDecorator,
    ListItemContent,
    Dropdown,
    Menu,
    MenuButton,
    MenuItem,
} from "@mui/joy"
import Settings from "./Setting"
import AddFilter from "./AddFilter"
import { MoreVert } from "@mui/icons-material"

export default function Navigation({
    filter,
    setFilter,
    currentFilter,
    deleteFilter,
    editFilter,
}: {
    filter: string[]
    setFilter: (name: string) => void
    deleteFilter: (filterName: string) => void
    editFilter: (filterName: string) => void
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
                        Browse
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
                        <ListItem>
                            <ListItemButton
                                selected={currentFilter == "All"}
                                onClick={() => setFilter("All")}
                            >
                                <ListItemDecorator>
                                    <AllInboxIcon fontSize="small" />
                                </ListItemDecorator>
                                <ListItemContent>All</ListItemContent>
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
                                <ListItem key={val}>
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
                                            <Dropdown>
                                                <MenuButton
                                                    slots={{ root: IconButton }}
                                                    slotProps={{
                                                        root: {
                                                            variant: "plain",
                                                        },
                                                    }}
                                                >
                                                    <MoreVert></MoreVert>
                                                </MenuButton>
                                                <Menu>
                                                    <MenuItem
                                                        onClick={() =>
                                                            editFilter(val)
                                                        }
                                                    >
                                                        <ListItemDecorator>
                                                            <ModeEditOutlineOutlinedIcon />
                                                        </ListItemDecorator>{" "}
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem
                                                        variant="soft"
                                                        color="danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteFilter(val)
                                                        }}
                                                    >
                                                        <ListItemDecorator
                                                            sx={{
                                                                color: "inherit",
                                                            }}
                                                        >
                                                            <DeleteRoundedIcon />
                                                        </ListItemDecorator>{" "}
                                                        Delete
                                                    </MenuItem>
                                                </Menu>
                                            </Dropdown>
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
                setFilter={setFilter}
            ></AddFilter>
        </>
    )
}
