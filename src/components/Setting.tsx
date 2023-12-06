import { ConfigContext } from "@/data/provider"
import { useContext, useRef } from "react"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"

import {
    Button,
    Divider,
    List,
    ListItem,
    ListItemDecorator,
    ListItemContent,
    Typography,
    Input,
    DialogActions,
    DialogContent,
    DialogTitle,
    Modal,
    ModalDialog,
    ListItemButton,
} from "@mui/joy"

export default function Settings({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const [config, updateConfig] = useContext(ConfigContext)
    const pullInterRef = useRef<HTMLInputElement>(null)
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <ModalDialog
                variant="outlined"
                role="alertdialog"
            >
                <DialogTitle>
                    <SettingsOutlinedIcon />
                    Settings
                </DialogTitle>
                <Divider inset="none" />
                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemContent>
                                <Typography>Pull interval</Typography>
                            </ListItemContent>
                            <ListItemDecorator>
                                <Input
                                    slotProps={{
                                        input: {
                                            ref: pullInterRef,
                                        },
                                    }}
                                    type="number"
                                    defaultValue={config.pullInterval}
                                    sx={{
                                        width: "6rem",
                                    }}
                                ></Input>
                            </ListItemDecorator>
                        </ListItem>
                        <ListItemButton
                            color="danger"
                            onClick={() => {
                                updateConfig({ ...config, validated: false })
                                onClose()
                            }}
                        >
                            Log out
                        </ListItemButton>
                    </List>
                </DialogContent>
                <Divider inset="none"></Divider>
                <DialogActions>
                    <Button
                        variant="solid"
                        onClick={() => {
                            updateConfig({
                                ...config,
                                pullInterval:
                                    Number(pullInterRef.current?.value) || 120,
                            })
                            onClose()
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        variant="plain"
                        color="neutral"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    )
}
