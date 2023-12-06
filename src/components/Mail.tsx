import Box from "@mui/joy/Box"
import Chip from "@mui/joy/Chip"
import Card from "@mui/joy/Card"
import CardOverflow from "@mui/joy/CardOverflow"
import Sheet from "@mui/joy/Sheet"
import Typography from "@mui/joy/Typography"
import Button from "@mui/joy/Button"
import AspectRatio from "@mui/joy/AspectRatio"
import Divider from "@mui/joy/Divider"
import Tooltip from "@mui/joy/Tooltip"
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"
import ForwardToInboxRoundedIcon from "@mui/icons-material/ForwardToInboxRounded"
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded"
import { Email } from "@/data/email"
import AttachmentIcon from "@mui/icons-material/Attachment"

export default function EmailContent({
    mail,
    deleteMail,
    forwardMail,
    replyMail,
}: {
    mail?: Email
    deleteMail: () => void
    forwardMail: () => void
    replyMail: () => void
}) {
    if (mail) {
        return (
            <Sheet
                variant="outlined"
                sx={{
                    minHeight: 500,
                    borderRadius: "sm",
                    p: 2,
                    m: 1,
                    ml: 0,
                    flexGrow: 1,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box sx={{ ml: 2 }}>
                            <Typography
                                level="title-md"
                                textColor="text.primary"
                                mb={0.5}
                            >
                                {mail.sender}
                            </Typography>
                            <Typography
                                level="body-sm"
                                textColor="text.tertiary"
                            >
                                {mail.sentTime.toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            height: "32px",
                            flexDirection: "row",
                            gap: 1.5,
                        }}
                    >
                        <Button
                            size="sm"
                            variant="plain"
                            color="neutral"
                            startDecorator={<ReplyRoundedIcon />}
                            onClick={replyMail}
                        >
                            Reply
                        </Button>

                        <Button
                            size="sm"
                            variant="plain"
                            color="neutral"
                            startDecorator={<ForwardToInboxRoundedIcon />}
                            onClick={forwardMail}
                        >
                            Forward
                        </Button>

                        <Button
                            size="sm"
                            variant="plain"
                            color="danger"
                            startDecorator={<DeleteRoundedIcon />}
                            onClick={deleteMail}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
                <Divider sx={{ mt: 2 }} />
                <Box
                    sx={{
                        py: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                    }}
                >
                    <Typography
                        level="title-lg"
                        textColor="text.primary"
                        textOverflow={"ellipsis"}
                        sx={{
                            flex: "100%",
                        }}
                    >
                        {mail.subject}
                    </Typography>
                    <Box
                        sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <Typography
                                component="span"
                                level="body-sm"
                                sx={{ mr: 1, display: "inline-block" }}
                            >
                                From
                            </Typography>
                            <Tooltip
                                size="sm"
                                title="Copy email"
                                variant="outlined"
                            >
                                <Chip
                                    size="sm"
                                    variant="soft"
                                    color="primary"
                                    onClick={() => {}}
                                >
                                    {mail.sender}
                                </Chip>
                            </Tooltip>
                        </div>
                        <div>
                            <Typography
                                component="span"
                                level="body-sm"
                                sx={{ mr: 1, display: "inline-block" }}
                            >
                                to
                            </Typography>
                            <Tooltip
                                size="sm"
                                title="Copy email"
                                variant="outlined"
                            >
                                <Chip
                                    size="sm"
                                    variant="soft"
                                    color="primary"
                                    onClick={() => {}}
                                >
                                    {mail.receiver}
                                </Chip>
                            </Tooltip>
                        </div>
                    </Box>
                </Box>
                <Divider />
                <div
                    ref={(ref) => ref?.replaceChildren(mail.content)}
                    className="h-fit"
                ></div>
                <Divider />
                {mail.attachment.length > 0 && (
                    <>
                        <Typography
                            level="title-sm"
                            mt={2}
                            mb={2}
                        >
                            Attachments
                        </Typography>
                        <Box
                            sx={(theme) => ({
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 2,
                                "& > div": {
                                    boxShadow: "none",
                                    "--Card-padding": "0px",
                                    "--Card-radius": theme.vars.radius.sm,
                                },
                            })}
                        >
                            {mail.attachment.map((attch) => {
                                if (attch.mime.startsWith("image/")) {
                                    return (
                                        <Card variant="outlined">
                                            <AspectRatio
                                                ratio="1"
                                                sx={{ minWidth: 80 }}
                                            >
                                                <img
                                                    src={`data:${attch.mime};base64, ${attch.contentBase64}`}
                                                    alt={attch.filename}
                                                />
                                            </AspectRatio>
                                        </Card>
                                    )
                                } else {
                                    return (
                                        <Card
                                            variant="outlined"
                                            orientation="horizontal"
                                        >
                                            <CardOverflow>
                                                <AspectRatio
                                                    ratio="1"
                                                    sx={{ minWidth: 80 }}
                                                >
                                                    <div>
                                                        <AttachmentIcon />
                                                    </div>
                                                </AspectRatio>
                                            </CardOverflow>
                                            <Box
                                                sx={{
                                                    py: { xs: 1, sm: 2 },
                                                    pr: 2,
                                                }}
                                            >
                                                <Typography
                                                    level="title-sm"
                                                    color="primary"
                                                >
                                                    {attch.filename}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    )
                                }
                            })}
                        </Box>
                    </>
                )}
            </Sheet>
        )
    } else {
        return (
            <div className="lg:flex hidden items-center justify-center flex-col flex-grow">
                <img
                    src="./icon.png"
                    width={200}
                />
                <Typography level="body-lg">
                    Open an email or start composing
                </Typography>
            </div>
        )
    }
}
