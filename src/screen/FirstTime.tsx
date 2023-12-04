import { useTheme } from "@mui/material/styles"
import DoneIcon from "@mui/icons-material/Done"
import { TextField, Button, Stack, Alert, AlertTitle } from "@mui/material"
import { useContext, useRef, useState } from "react"
import { POP3Wrapper, SMTPWrapper } from "../socket"
import Collapse from "@mui/material/Collapse"
import { useNavigate } from "react-router-dom"
import { ConfigContext } from "@/data/provider"

const variant = "standard"
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
    const theme = useTheme()
    const [inputState, setInputState] = useState<
        "good" | "normal" | "bad" | "loading"
    >("normal")
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
                setErrorState(() => oldErrorState)
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
                setErrorState(() => oldErrorState)
                return
            }
            if (password.current) {
                await pop3.USER(password.current.value).catch((e) => {
                    oldErrorState.password = true
                    oldErrorState.err = e
                })
            }
            if (oldErrorState.err.length) {
                setInputState("bad")
                setErrorState(() => oldErrorState)
                return
            }
        }
        console.log("Checking SMTP")
        if (server.current && smtpPort.current) {
            const SMTP = new SMTPWrapper()
            const smtpP = Number(smtpPort.current.value)
            if (!smtpP) {
                oldErrorState.smtpPort = true
                oldErrorState.err = "Check your SMPT port number"
                setInputState("bad")
                setErrorState(() => oldErrorState)

                return
            }
            await SMTP.test(server.current.value, smtpP).catch((e) => {
                oldErrorState.server = oldErrorState.smtpPort = true
                oldErrorState.err = e
            })
        }
        setErrorState(() => oldErrorState)
        if (!errorState.err.length) {
            setInputState("good")
        }
    }

    return (
        <div
            className="flex flex-col justify-center items-center"
            style={{
                width: "100dvw",
                height: "100dvh",
            }}
        >
            {/* <img
                src={bg}
                style={{
                    width: "100dvw",
                    height: "100dvh",
                    position: "fixed",
                    zIndex: -1,
                }}
            /> */}
            <div
                className="border-2 border-solid rounded-md p-8 min-w-80 max-w-md w-1/2"
                style={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.primary.main,
                }}
            >
                <Stack spacing={2}>
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

                    <TextField
                        variant={variant}
                        size="small"
                        placeholder="your@email.here"
                        label="Email"
                        inputRef={email}
                        error={errorState.email}
                    ></TextField>
                    <TextField
                        variant={variant}
                        size="small"
                        placeholder="Password"
                        label="Password"
                        inputRef={password}
                        error={errorState.password}
                    />
                    <TextField
                        variant={variant}
                        size="small"
                        placeholder="SMTP server"
                        inputRef={server}
                        label="SMTP server"
                        error={errorState.server}
                    />
                    <div className="flex gap-2">
                        <TextField
                            variant={variant}
                            size="small"
                            placeholder="SMTP port"
                            label="SMTP port"
                            type="number"
                            error={errorState.smtpPort}
                            inputRef={smtpPort}
                        />
                        <TextField
                            variant={variant}
                            size="small"
                            placeholder="POP3 port"
                            label="POP3 port"
                            type="number"
                            error={errorState.pop3Port}
                            inputRef={pop3Port}
                        />
                    </div>
                    <div className="flex justify-end gap-2 items-center">
                        <div
                            style={{
                                display:
                                    inputState == "good" ? "block" : "none",
                            }}
                        >
                            <DoneIcon />
                        </div>
                        {inputState == "loading" && (
                            <div
                                className="animate-spin border-t-black border-transparent border-solid w-8 h-8"
                                style={{
                                    borderRadius: "50%",
                                }}
                            ></div>
                        )}
                        <Button
                            variant={"contained"}
                            onClick={CheckInput}
                        >
                            Test
                        </Button>
                        <Button
                            variant={"contained"}
                            disabled={inputState != "good"}
                            onClick={() => {
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
                            }}
                        >
                            OK
                        </Button>
                    </div>
                    <Collapse
                        orientation="vertical"
                        in={!!errorState.err.length}
                        collapsedSize={0}
                    >
                        <Alert
                            severity="error"
                            className="min-w-80 max-w-md flex-1"
                            onClose={() => {
                                setErrorState((old) => ({ ...old, err: "" }))
                            }}
                        >
                            <AlertTitle>Error</AlertTitle>
                            <strong>{errorState.err}</strong>
                        </Alert>
                    </Collapse>
                </Stack>
            </div>
        </div>
    )
}

export default FirstTime
