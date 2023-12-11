import { ConfigContext } from "@/data/provider"
import { useContext, useEffect, useRef, useState } from "react"

import {
    Button,
    Divider,
    FormControl,
    FormLabel,
    Input,
    DialogActions,
    DialogContent,
    DialogTitle,
    Modal,
    ModalDialog,
    FormHelperText,
    Stack,
} from "@mui/joy"
import { AddRounded } from "@mui/icons-material"

export default function AddFilter({
    open,
    onClose,
    setFilter,
}: {
    open: boolean
    setFilter: (name: string) => void
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
                config.filters.findIndex((val) => val.name == filterName) !=
                    -1 ||
                filterName == "Inbox" ||
                filterName == "Sent" ||
                filterName == "All"
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
                        <FormControl
                            required
                            error={error}
                        >
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
                            old.filters.push({
                                name: filterName,
                                rule: {
                                    mail: (sender.current?.value ?? "")
                                        .split(",")
                                        .map((val) => val.trim())
                                        .filter((val) => val.length),
                                    subject: (subject.current?.value ?? "")
                                        .split(",")
                                        .map((val) => val.trim())
                                        .filter((val) => val.length),
                                    content: (content.current?.value ?? "")
                                        .split(",")
                                        .map((val) => val.trim())
                                        .filter((val) => val.length),
                                },
                            })
                            updateConfig(old)
                            setFilterName("")
                            setFilter(filterName)
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
