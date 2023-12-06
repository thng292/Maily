import { ConfigContext } from "@/data/provider"
import { useContext, useEffect, useRef, useState } from "react"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"

import {
    Button,
    Divider,
    List,
    ListItem,
    ListItemDecorator,
    ListItemContent,
    Typography,
    FormControl,
    FormLabel,
    Input,
    DialogActions,
    DialogContent,
    DialogTitle,
    Modal,
    ModalDialog,
    ListItemButton,
    FormHelperText,
    Autocomplete,
    Stack,
    Chip,
} from "@mui/joy"
import { AddRounded } from "@mui/icons-material"

export default function AddFilter({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const [config, updateConfig] = useContext(ConfigContext)
    const sender = useRef<HTMLInputElement>(null)
    const subject = useRef<HTMLInputElement>(null)
    const content = useRef<HTMLInputElement>(null)
    const [filterName, setFilterName] = useState<string>("")
    const [focus, setFocus] = useState<0 | 1 | 2 | 3>(0)
    const [error, setError] = useState(false)

    useEffect(() => {
        const tmp = setTimeout(() => {
            if (
                config.filters.findIndex(
                    (val) => val.name == filterName.at(-1),
                ) != -1 ||
                filterName.at(-1) == "Inbox" ||
                filterName.at(-1) == "Sent"
            ) {
                setError(true)
            } else {
                setError(false)
            }
        }, 200)
        return () => clearTimeout(tmp)
    }, [filterName])

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
                    <AddRounded />
                    Add Filter
                </DialogTitle>
                <Divider inset="none" />
                <DialogContent>
                    <Stack gap={1}>
                        <FormControl required>
                            <FormLabel>Filter name</FormLabel>
                            <Input
                                value={filterName}
                                onChange={(e) => {
                                    setFilterName(e.currentTarget.value)
                                }}
                                type="text"
                            ></Input>
                        </FormControl>
                        <Divider sx={{ m: 1 }}>
                            <strong>Rules</strong>
                        </Divider>
                        <FormControl>
                            <FormLabel>Sender</FormLabel>
                            <Input
                                onFocus={() => setFocus(1)}
                                slotProps={{
                                    input: {
                                        ref: sender,
                                    },
                                }}
                            />
                            {focus == 1 && (
                                <FormHelperText>Comma separated</FormHelperText>
                            )}
                        </FormControl>
                        <FormControl>
                            <FormLabel>Subject</FormLabel>
                            <Input
                                onFocus={() => setFocus(2)}
                                slotProps={{
                                    input: {
                                        ref: subject,
                                    },
                                }}
                            />
                            {focus == 2 && (
                                <FormHelperText>Comma separated</FormHelperText>
                            )}
                        </FormControl>
                        <FormControl>
                            <FormLabel>Content</FormLabel>
                            <Input
                                onFocus={() => setFocus(3)}
                                slotProps={{
                                    input: {
                                        ref: content,
                                    },
                                }}
                            />
                        </FormControl>
                        {focus == 3 && (
                            <FormHelperText>Comma separated</FormHelperText>
                        )}
                    </Stack>
                </DialogContent>
                <Divider inset="none"></Divider>
                <DialogActions>
                    <Button
                        variant="solid"
                        onClick={(e) => {
                            e.preventDefault()
                            const old = structuredClone(config)

                            updateConfig({
                                ...old,
                                filters: [
                                    ...old.filters,
                                    {
                                        name: filterName,
                                        rule: {
                                            mail: (sender.current?.value ?? "")
                                                .split(",")
                                                .map((val) => val.trim()),
                                            subject: (
                                                subject.current?.value ?? ""
                                            )
                                                .split(",")
                                                .map((val) => val.trim()),
                                            content: (
                                                content.current?.value ?? ""
                                            )
                                                .split(",")
                                                .map((val) => val.trim()),
                                        },
                                    },
                                ],
                            })
                            onClose()
                        }}
                    >
                        Add
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
