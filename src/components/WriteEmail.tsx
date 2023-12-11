import * as React from "react"
import Box from "@mui/joy/Box"
import ModalClose from "@mui/joy/ModalClose"
import Button from "@mui/joy/Button"
import FormControl from "@mui/joy/FormControl"
import FormLabel from "@mui/joy/FormLabel"
import Textarea from "@mui/joy/Textarea"
import Sheet from "@mui/joy/Sheet"
import {
    Container,
    FormHelperText,
    IconButton,
    Input,
    Stack,
    Typography,
} from "@mui/joy"

import QEditor from "./QEditor"
import { Attachment, Email, MailBuilder } from "@/data/email"
import { useState } from "react"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import { GetFileSize } from "@/utils/GetFileSize"
import { AttachmentOutlined } from "@mui/icons-material"
import mime from "mime"
import fs from "fs"
import path from "path"
import AttachmentCard from "./AttachmentCard"
import AlertModal from "./AlertModal"
import { isQuillEmpty } from "@/utils/IsQuillEmpty"
import { validateCc } from "@/utils/ValidateCc"

interface WriteEmailProps {
    open: boolean
    onClose: () => void
    isReply: boolean
    isForward: boolean
    mail: Email | null
}

const WriteEmail = React.forwardRef<HTMLDivElement, WriteEmailProps>(
    function WriteEmail({ open, onClose, isReply, isForward, mail }, ref) {
        const [value, setValue] = useState("")
        const [receiver, setReceiver] = useState("")
        const [bcc, setBcc] = useState("")
        const [cc, setCc] = useState("")
        const [subject, setSubject] = useState("")
        const [sending, setSending] = useState(false)
        const [attatchments, setAttatchments] = useState<Attachment[]>()

        const [focus, setFocus] = useState(0)
        const [attachAlertOpen, setAttachAlertOpen] = useState(false)
        const [emptyAlertOpen, setEmptyAlertOpen] = useState(false)
        const [ccAlertOpen, setCcAlertOpen] = useState(false)
        const attachSize = React.useRef(0)
        const formRef = React.useRef<HTMLFormElement>(null)

        const [config, updateConfig] = React.useContext(ConfigContext)
        const [mailbox, dispatchMailBox] = React.useContext(MailBoxContext)

        React.useEffect(() => {
            if (isReply) {
                setReceiver(mail!.sender)
                setValue("")
            }
            if (isForward) {
                setValue(mail!.content.outerHTML)
                setAttatchments(mail!.attachment)
                setReceiver("")
            }

            if (sending) {
                if (mailbox.state == "success") {
                    setValue("")
                    setReceiver("")
                    setBcc("")
                    setCc("")
                    setSubject("")
                    setAttatchments([])
                    setFocus(0)
                    attachSize.current = 0

                    setSending(false)
                    onClose()
                }
            }
        }, [isReply, isForward, mailbox])

        const sendMail = React.useCallback(
            (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault()

                if (isQuillEmpty(value) && !attatchments) {
                    setEmptyAlertOpen(true)
                    return
                }

                let mail = new MailBuilder()
                if (bcc != "") {
                    if (!validateCc(bcc)) {
                        setCcAlertOpen(true)
                        return
                    } else {
                        mail.addBCC(bcc.split(",").map((val) => val.trim()))
                    }
                }

                if (cc != "") {
                    if (!validateCc(cc)) {
                        setCcAlertOpen(true)
                        return
                    } else {
                        mail.addCC(cc.split(",").map((val) => val.trim()))
                    }
                }

                const newDiv = document.createElement("div")
                newDiv.innerHTML = value
                mail.addSender(config.username)
                mail.addReceiver(receiver.split(","))
                mail.addSubject(subject)
                mail.addContent(newDiv)
                if (attatchments) {
                    mail.addAttachment(attatchments)
                }

                dispatchMailBox({ action: "Send", email: mail })
                setSending(true)
            },
            [value, receiver, bcc, cc, attatchments, config, dispatchMailBox],
        )

        const handleFile = React.useCallback(async () => {
            let filePaths = await window.electronAPI.openLoad()
            if (filePaths) {
                let attList: Attachment[] = []

                filePaths.forEach((filePath) => {
                    const fileName = path.basename(filePath)
                    let contains =
                        attatchments?.some(
                            (attach) => attach.filename == fileName,
                        ) ||
                        attList.some((attach) => attach?.filename == fileName)
                    if (!contains) {
                        const fileMime = mime.getType(filePath)
                        const fileContent = fs.readFileSync(filePath, {
                            encoding: "base64",
                        })
                        let att: Attachment = {
                            filename: fileName,
                            mime: fileMime!,
                            contentBase64: fileContent,
                        }
                        attList.push(att)
                    }
                })

                const attSizeSum = attList.reduce(
                    (acc, val) => acc + GetFileSize(val!),
                    0,
                )
                if (attachSize.current + attSizeSum <= 3072) {
                    if (attatchments) {
                        setAttatchments([...attatchments, ...attList])
                    } else {
                        setAttatchments(attList)
                    }
                    attachSize.current += attSizeSum
                } else {
                    setAttachAlertOpen(true)
                }
            }
        }, [attatchments])

        const deleteAttach = React.useCallback(
            (index: number) => {
                setAttatchments((prev) => {
                    attachSize.current -= GetFileSize(prev![index])
                    const updatedAttach = [...prev!]
                    updatedAttach.splice(index, 1)
                    return updatedAttach
                })
            },
            [attatchments],
        )

        return (
            <Container
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
                    <Typography
                        level="title-md"
                        className="font-bold"
                    >
                        New message
                    </Typography>
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
                    <form
                        onSubmit={sendMail}
                        ref={formRef}
                    >
                        <FormControl>
                            <FormLabel>To</FormLabel>
                            <Input
                                placeholder="email@email.com"
                                aria-label="Message"
                                type="email"
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                                onFocus={() => setFocus(0)}
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>CC</FormLabel>
                            <Input
                                placeholder="email@email.com, email@email.com,..."
                                aria-label="Message"
                                value={cc}
                                onChange={(e) => setCc(e.target.value)}
                                onFocus={() => setFocus(1)}
                            />
                            {focus == 1 && (
                                <FormHelperText>Comma separated</FormHelperText>
                            )}
                        </FormControl>
                        <FormControl>
                            <FormLabel>BCC</FormLabel>
                            <Input
                                placeholder="email@email.com, email@email.com,..."
                                aria-label="Message"
                                value={bcc}
                                onChange={(e) => setBcc(e.target.value)}
                                onFocus={() => setFocus(2)}
                            />
                            {focus == 2 && (
                                <FormHelperText>Comma separated</FormHelperText>
                            )}
                        </FormControl>
                        <FormControl className="pb-2">
                            <FormLabel>Subject</FormLabel>
                            <Input
                                placeholder="Subject"
                                aria-label="Message"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                onFocus={() => setFocus(3)}
                            />
                        </FormControl>
                        <FormControl className="pb-2">
                            <QEditor
                                value={value}
                                setValue={setValue}
                                setFocus={setFocus}
                            ></QEditor>
                        </FormControl>
                        <FormControl>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                            >
                                <IconButton
                                    onClick={handleFile}
                                    onFocus={() => setFocus(5)}
                                >
                                    <AttachmentOutlined />
                                </IconButton>
                                <Stack
                                    direction="row"
                                    className="max-h-full overflow-x-auto grow"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    {attatchments &&
                                        attatchments.map((attach, index) => (
                                            <AttachmentCard
                                                key={attach.filename}
                                                attachment={attach}
                                                onDelete={() =>
                                                    deleteAttach(index)
                                                }
                                            ></AttachmentCard>
                                        ))}
                                </Stack>

                                <Button
                                    color="primary"
                                    sx={{ borderRadius: "sm" }}
                                    loading={sending}
                                    type="submit"
                                >
                                    Send
                                </Button>
                            </Stack>
                        </FormControl>
                    </form>
                </Box>
                <AlertModal
                    open={attachAlertOpen}
                    setOpen={setAttachAlertOpen}
                    title="Attachment size limit exceeded"
                    content="Total attachment size must be less than 3 MB"
                ></AlertModal>
                <AlertModal
                    open={emptyAlertOpen}
                    setOpen={setEmptyAlertOpen}
                    title="Empty mail"
                    content="Your mail must contain either content or attachments"
                ></AlertModal>
                <AlertModal
                    open={ccAlertOpen}
                    setOpen={setCcAlertOpen}
                    title="Invalid CC/BCC"
                    content="Make sure CC/BCC is in the correct format"
                ></AlertModal>
            </Container>
        )
    },
)

export default WriteEmail
