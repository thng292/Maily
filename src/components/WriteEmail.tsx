import * as React from "react"
import Box from "@mui/joy/Box"
import ModalClose from "@mui/joy/ModalClose"
import Button from "@mui/joy/Button"
import FormControl from "@mui/joy/FormControl"
import FormLabel from "@mui/joy/FormLabel"
import Textarea from "@mui/joy/Textarea"
import Sheet from "@mui/joy/Sheet"
import { IconButton, Input, Stack, Typography } from "@mui/joy"

import QEditor from "./QEditor"
import { MailBuilder } from "@/data/email"
import { useState } from "react"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import { fileTypeFromFile } from "file-type"
// import { fileTypeFromFile } from "file-type"

interface WriteEmailProps {
    open?: boolean
    onClose?: () => void
}

const WriteEmail = React.forwardRef<HTMLDivElement, WriteEmailProps>(
    function WriteEmail({ open, onClose }, ref) {
        const [value, setValue] = useState("")
        const [receiver, setReceiver] = useState("")
        const [bcc, setBcc] = useState("")
        const [cc, setCc] = useState("")

        const [config, updateConfig] = React.useContext(ConfigContext)
        const [mailbox, dispatchMailBox] = React.useContext(MailBoxContext)
        const [attatchments, setAttatchments] = useState()

        const sendMail = React.useCallback(() => {
            const newDiv = document.createElement("div")
            newDiv.innerHTML = value
            console.log(value)
            let mail = new MailBuilder()
            mail.addContent(newDiv)
            mail.addReceiver(receiver.split(","))
            mail.addSender(config.username)
            mail.addBCC(bcc.split(",").map((val) => val.trim()))
            mail.addCC(cc.split(",").map((val) => val.trim()))
            // mail.addAttachment()

            dispatchMailBox({ action: "Send", payload: mail })
        }, [value, receiver, config, dispatchMailBox])

        const handleFile = React.useCallback(async () => {
            let res = await window.electronAPI.openLoad()
            let files = res?.map((filePath) => {
                return fileTypeFromFile(filePath)
            })
            console.log(files)
        }, [])

        return (
            <Sheet
                ref={ref}
                sx={{
                    alignItems: "center",
                    px: 1.5,
                    py: 1.5,
                    ml: "auto",
                    width: { xs: "100dvw", md: 600 },
                    flexGrow: 1,
                    border: "1px solid",
                    borderRadius: "8px 8px 0 0",
                    backgroundColor: "background.level1",
                    borderColor: "neutral.outlinedBorder",
                    boxShadow: "lg",
                    zIndex: 1000,
                    position: "fixed",
                    bottom: 0,
                    right: 24,
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Typography level="title-sm">New message</Typography>
                    <ModalClose
                        id="close-icon"
                        onClick={onClose}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flexShrink: 0,
                    }}
                >
                    <FormControl>
                        <FormLabel>To</FormLabel>
                        <Input
                            placeholder="email@email.com"
                            aria-label="Message"
                            type="email"
                            onChange={(e) => setReceiver(e.target.value)}
                            value={receiver}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>CC</FormLabel>
                        <Input
                            placeholder="email@email.com"
                            aria-label="Message"
                            onChange={(e) => setCc(e.target.value)}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>BCC</FormLabel>
                        <Input
                            placeholder="email@email.com"
                            aria-label="Message"
                            onChange={(e) => setBcc(e.target.value)}
                        />
                    </FormControl>
                    <Input
                        placeholder="Subject"
                        aria-label="Message"
                    />
                    <FormControl>
                        <QEditor
                            value={value}
                            setValue={setValue}
                        ></QEditor>
                    </FormControl>
                    <Button
                        color="primary"
                        sx={{ borderRadius: "sm" }}
                        onClick={sendMail}
                    >
                        Send
                    </Button>
                    <Button onClick={handleFile}>Attatchment</Button>
                </Box>
            </Sheet>
        )
    },
)

export default WriteEmail
