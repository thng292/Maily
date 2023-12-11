import * as React from "react"
import Button from "@mui/joy/Button"
import Divider from "@mui/joy/Divider"
import DialogTitle from "@mui/joy/DialogTitle"
import DialogContent from "@mui/joy/DialogContent"
import DialogActions from "@mui/joy/DialogActions"
import Modal from "@mui/joy/Modal"
import ModalDialog from "@mui/joy/ModalDialog"
import DeleteForever from "@mui/icons-material/DeleteForever"
import WarningRoundedIcon from "@mui/icons-material/WarningRounded"

interface Props {
    title: string
    content: string
    open: boolean
    setOpen: (val: boolean) => void
}

export default function AlertModal({ title, content, open, setOpen }: Props) {
    return (
        <React.Fragment>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <ModalDialog
                    variant="outlined"
                    role="alertdialog"
                >
                    <DialogTitle>
                        <WarningRoundedIcon />
                        {title}
                    </DialogTitle>
                    <Divider />
                    <DialogContent>{content}</DialogContent>
                    <DialogActions>
                        <Button
                            variant="plain"
                            color="neutral"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </React.Fragment>
    )
}
