import DoneIcon from "@mui/icons-material/Done"
import { useContext, useEffect, useRef, useState } from "react"
import { POP3Wrapper, SMTPWrapper } from "../socket"
import { Navigate, useNavigate } from "react-router-dom"
import { ConfigContext, MailBoxContext } from "@/data/provider"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { useTheme } from "@mui/joy/styles"
import {
    Stack,
    FormControl,
    FormLabel,
    Button,
    Input,
    Card,
    CircularProgress,
    IconButton,
    Alert,
} from "@mui/joy"

const defaultErr = {
    email: false,
    password: false,
    smtpPort: false,
    server: false,
    pop3Port: false,
    err: "",
}

function FirstTime() {
    const navigate = useNavigate()
    const [config, updateConfig] = useContext(ConfigContext)
    const [_, dispatchMailBox] = useContext(MailBoxContext)
    const theme = useTheme()
    const [inputState, setInputState] = useState<
        "good" | "normal" | "bad" | "loading"
    >("normal")
    const [showPassword, togglePassword] = useState(false)
    const [errorState, setErrorState] = useState(defaultErr)
    const email = useRef<HTMLInputElement>(null)
    const password = useRef<HTMLInputElement>(null)

    const server = useRef<HTMLInputElement>(null)
    const smtpPort = useRef<HTMLInputElement>(null)
    const pop3Port = useRef<HTMLInputElement>(null)

    async function CheckInput() {
        setInputState("loading")
        const oldErrorState = structuredClone(defaultErr)
        if (server.current && pop3Port.current) {
            const pop3 = new POP3Wrapper()
            const pop3P = Number(pop3Port.current.value)
            if (!pop3P) {
                oldErrorState.pop3Port = true
                oldErrorState.err = "Check your POP3 port number"
                setInputState("bad")
                setErrorState(() => oldErrorState)
                return
            }
            await pop3.connect(server.current.value, pop3P).catch((e) => {
                oldErrorState.pop3Port = oldErrorState.server = true
                oldErrorState.err = e
            })
            if (oldErrorState.err.length) {
                setInputState("bad")
                setErrorState(oldErrorState)
                return
            }
            if (email.current) {
                await pop3.USER(email.current.value).catch((e) => {
                    oldErrorState.email = true
                    oldErrorState.err = e
                })
            }
            if (oldErrorState.err.length) {
                setInputState("bad")
                setErrorState(oldErrorState)
                return
            }
            if (password.current) {
                await pop3.PASS(password.current.value).catch((e) => {
                    oldErrorState.password = true
                    oldErrorState.err = e
                })
            }
            if (oldErrorState.err.length) {
                setInputState("bad")
                setErrorState(oldErrorState)
                return
            }
        }
        if (server.current && smtpPort.current) {
            const SMTP = new SMTPWrapper()
            const smtpP = Number(smtpPort.current.value)
            if (!smtpP) {
                oldErrorState.smtpPort = true
                oldErrorState.err = "Check your SMPT port number"
                setInputState("bad")
                setErrorState(oldErrorState)
                return
            }
            await SMTP.test(server.current.value, smtpP).catch((e) => {
                oldErrorState.server = oldErrorState.smtpPort = true
                oldErrorState.err = e
                setInputState("bad")
            })
        }
        setErrorState(oldErrorState)
        if (!errorState.err.length) {
            dispatchMailBox({ action: "ClearDB" })
            setInputState("good")
            updateConfig({
                ...config,
                validated: true,
                username: email.current!.value,
                password: password.current!.value,
                server: server.current!.value,
                SMTPport: Number(smtpPort.current!.value),
                POP3port: Number(pop3Port.current!.value),
            })
            navigate("/", {
                replace: true,
                relative: "route",
            })
        }
    }

    if (config.validated) {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    return (
        <div
            className="flex flex-col justify-center items-center"
            style={{
                width: "100dvw",
                height: "100dvh",
            }}
        >
            <div className="min-w-min max-w-md w-1/3">
                <Card size="lg">
                    <Stack
                        gap={4}
                        sx={{ mt: 2 }}
                    >
                        <div className="py-4 flex flex-col gap-2">
                            <p
                                className="font-semibold text-4xl"
                                style={{ color: theme.palette.text.primary }}
                            >
                                First time?
                            </p>
                            <p
                                className="font-normal"
                                style={{ color: theme.palette.text.primary }}
                            >
                                We need some infomation to set the stuff up.
                            </p>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                CheckInput()
                            }}
                        >
                            <FormControl
                                error={errorState.email}
                                required
                            >
                                <FormLabel>Email</FormLabel>
                                <Input
                                    slotProps={{
                                        input: {
                                            ref: email,
                                        },
                                    }}
                                    type="email"
                                    name="email"
                                    placeholder="your@email.here"
                                    defaultValue={config.username}
                                />
                            </FormControl>
                            <FormControl
                                error={errorState.password}
                                required
                            >
                                <FormLabel>Password</FormLabel>
                                <Input
                                    slotProps={{
                                        input: {
                                            ref: password,
                                        },
                                    }}
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    defaultValue={config.password}
                                    placeholder="password"
                                    endDecorator={
                                        <IconButton
                                            onClick={() =>
                                                togglePassword((old) => !old)
                                            }
                                        >
                                            {showPassword ? (
                                                <VisibilityOffIcon />
                                            ) : (
                                                <VisibilityIcon />
                                            )}
                                        </IconButton>
                                    }
                                />
                            </FormControl>
                            <FormControl
                                error={errorState.server}
                                required
                            >
                                <FormLabel>Server</FormLabel>
                                <Input
                                    slotProps={{
                                        input: {
                                            ref: server,
                                        },
                                    }}
                                    type="text"
                                    name="server"
                                    defaultValue={config.server}
                                    placeholder="Server"
                                />
                            </FormControl>
                            <div className="grid grid-cols-2 grid-row-1 gap-2">
                                <FormControl
                                    error={errorState.pop3Port}
                                    required
                                >
                                    <FormLabel>POP3 Port</FormLabel>
                                    <Input
                                        slotProps={{
                                            input: {
                                                ref: pop3Port,
                                            },
                                        }}
                                        type="number"
                                        defaultValue={config.POP3port}
                                        name="pop3port"
                                    />
                                </FormControl>
                                <FormControl
                                    error={errorState.smtpPort}
                                    required
                                >
                                    <FormLabel>SMTP Port</FormLabel>
                                    <Input
                                        slotProps={{
                                            input: {
                                                ref: smtpPort,
                                            },
                                        }}
                                        type="number"
                                        defaultValue={config.SMTPport}
                                        name="smtpport"
                                    />
                                </FormControl>
                            </div>

                            <Stack
                                gap={4}
                                sx={{ mt: 2 }}
                            >
                                {!!errorState.err.length && (
                                    <Alert>
                                        <strong>{errorState.err}</strong>
                                    </Alert>
                                )}
                                <Button
                                    type="submit"
                                    color={(() => {
                                        switch (inputState) {
                                            case "good":
                                                return "success"
                                            case "normal":
                                                return "primary"
                                            case "bad":
                                                return "danger"
                                            case "loading":
                                                return "primary"
                                        }
                                    })()}
                                    fullWidth
                                >
                                    {inputState == "loading" ? (
                                        <CircularProgress
                                            size="sm"
                                            variant="soft"
                                        />
                                    ) : (
                                        "Go"
                                    )}
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Card>
            </div>
        </div>
    )
}

export default FirstTime
