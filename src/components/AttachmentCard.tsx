import React from "react"
import { Card, CardContent, Typography, IconButton, Stack } from "@mui/joy"
import { Attachment } from "@/data/email"
import { GetFileSize } from "@/utils/GetFileSize"
import CloseIcon from "@mui/icons-material/Close"

interface Props {
    attachment: Attachment
    onDelete: () => void
}

const AttachmentCard = ({ attachment, onDelete }: Props) => {
    return (
        <Card variant="outlined">
            <CardContent>
                <Stack direction="row">
                    <IconButton
                        aria-label="delete"
                        onClick={onDelete}
                        style={{ position: "absolute", top: 0, right: 0 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography className="max-w-[15rem] overflow-hidden overflow-ellipsis whitespace-nowrap">
                        [ {GetFileSize(attachment).toFixed(2)} KB]
                        {attachment.filename}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    )
    // return <div></div>
}

export default AttachmentCard
