import React from "react"
import { Typography } from "@mui/material"
import { Email } from "@/data/email/types"

interface Props {
    displayEmail?: Email
}

const EmailDisplay: React.FC<Props> = ({ displayEmail }) => {
    if (!displayEmail) {
        return <div>No mail selected</div>
    }
    return (
        <div>
            <div>
                <Typography variant="h5">{displayEmail.subject}</Typography>
            </div>
            <Typography variant="subtitle1">{displayEmail.sender}</Typography>
        </div>
    )
}

export default EmailDisplay
