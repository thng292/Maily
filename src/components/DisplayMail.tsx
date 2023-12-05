import { Button, Divider, IconButton, Paper, Stack } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import AttachmentIcon from "@mui/icons-material/Attachment"
import { useTheme } from "@mui/material/styles"
import { Email } from "@/data/email"
import ReplyIcon from "@mui/icons-material/Reply"
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread"
import DeleteIcon from "@mui/icons-material/Delete"

export function DisplayMail({
    mail,
    close,
}: {
    mail: Email | null
    close: () => void
}) {
    const theme = useTheme()
    if (mail) {
        return (
            <div className="w-full">
                <Stack
                    direction={"row"}
                    alignItems={"center"}
                    overflow={"hidden"}
                >
                    <IconButton onClick={close}>
                        <ArrowBackIcon />
                    </IconButton>
                    <p
                        className="font-semibold text-xl px-4"
                        style={{
                            color: theme.palette.text.primary,
                        }}
                    >
                        {mail.subject}
                    </p>
                </Stack>
                <Divider></Divider>
                <Stack
                    direction={"row"}
                    gap={2}
                    sx={{
                        margin: "0.5rem",
                    }}
                >
                    <Button startIcon={<DeleteIcon />}>Delete</Button>
                    <Button startIcon={<MarkAsUnreadIcon />}>
                        Mark as unread
                    </Button>
                    <Button startIcon={<AddIcon />}>Add to</Button>
                    <Button startIcon={<ReplyIcon />}>Reply</Button>
                </Stack>
                <p
                    className="font-normal text-md px-4"
                    style={{
                        color: theme.palette.text.primary,
                    }}
                >
                    From: {mail.sender}
                </p>
                <div
                    className="p-4"
                    ref={(ref) => ref?.replaceChildren(mail.content)}
                ></div>
                <div>
                    {mail.attachment.map((attch) => {
                        if (attch.mime.startsWith("image/")) {
                            return (
                                <img
                                    src={`data:${attch.mime};base64, ${attch.contentBase64}`}
                                    alt={attch.filename}
                                />
                            )
                        } else {
                            return (
                                <Paper>
                                    <AttachmentIcon></AttachmentIcon>
                                </Paper>
                            )
                        }
                    })}
                </div>
            </div>
        )
    } else {
        return (
            <div className="w-full flex flex-col items-center justify-center">
                <img
                    src="./icon.png"
                    width={150}
                    className="p-4"
                />
                <p
                    className="text-lg font-normal"
                    style={{
                        color: theme.palette.text.primary,
                    }}
                >
                    Select an email to open
                </p>
            </div>
        )
    }
}
