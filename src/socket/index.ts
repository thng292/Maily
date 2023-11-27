import { Socket } from "node:net"

type STATResult = {
    count: number
    size: number
}

type UIDLResult = {
    id: number
    uid: string
}

class POP3Wrapper {
    socket: Socket

    constructor() {
        this.socket = new Socket()
    }

    connect(server: string, port: number): Promise<void> {
        return new Promise((onRes, onErr) => {
            this.socket.connect(port, server, () => {})
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    onRes()
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", ""),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    USER(username: string): Promise<void> {
        return new Promise((onRes, onErr) => {
            this.socket.write(`USER ${username}\r\n`)
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    onRes()
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", ""),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    PASS(password: string): Promise<void> {
        return new Promise((onRes, onErr) => {
            this.socket.write(`PASS ${password}\r\n`)
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    onRes()
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", ""),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    STAT(): Promise<STATResult> {
        return new Promise((onRes, onErr) => {
            let sub: string[] = []
            this.socket.write("STAT\r\n")
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    sub = data
                        .toString()
                        .replace("+OK ", "")
                        .replace("\r\n", "")
                    const sep = sub.indexOf(" ")
                    onRes({
                        count: parseInt(sub.slice(0, sep - 1)),
                        size: parseInt(sub.slice(sep + 1)),
                    } satisfies STATResult)
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", ""),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    UIDL(msgNumber?: number): Promise<UIDLResult[]> {
        return new Promise((onRes, onErr) => {
            let sub: string[] = []
            let re: UIDLResult[] = []
            if (msgNumber == undefined) {
                this.socket.write("UIDL\r\n")
            } else {
                this.socket.write(`UIDL ${msgNumber}\r\n`)
            }
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    sub = data
                        .toString()
                        .replace("+OK\r\n", "")
                        .replace("\r\n.\r\n", "")
                        .split("\r\n")
                    for (let item of sub) {
                        const sep = item.indexOf(" ")
                        const id = parseInt(item.slice(0, sep))
                        const uid = item.slice(sep + 1)
                        re.push({
                            id,
                            uid,
                        })
                    }
                    onRes(re)
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", ""),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    RETR(msgNumber: number): Promise<string> {
        return new Promise((onRes, onErr) => {
            this.socket.write(`RETR ${msgNumber}\r\n`)
            this.socket.once("data", (data) => {
                const tmp = data.toString()
                if (tmp.startsWith("+OK")) {
                    onRes(tmp.slice(tmp.indexOf("\r\n")))
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", "\n"),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    DELE(msgNumber: number): Promise<void> {
        return new Promise((onRes, onErr) => {
            this.socket.write(`DELE ${msgNumber}\r\n`)
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    onRes()
                }
                if (data.toString().startsWith("-ERR")) {
                    onErr(
                        data
                            .toString()
                            .replace("-ERR ", "")
                            .replace("\r\n", ""),
                    )
                }
            })
            this.socket.once("error", (data) => {
                onErr(data.message)
            })
        })
    }

    QUIT(): Promise<void> {
        return new Promise((onRes, onErr) => {
            this.socket.write("QUIT\r\n")
            this.socket.on("data", (data) => {
                const tmp = data.toString()
                if (tmp.startsWith("-ERR")) {
                    console.error(`QUIT reply ` + data.toString())
                    onErr(tmp.slice(5))
                } else {
                    onRes()
                }
            })
        })
    }

    destroy() {
        this.socket.end()
    }
}

class SMTPWrapper {
    send(
        server: string,
        port: number,
        from: string,
        to: string[],
        content: string,
    ): Promise<void> {
        return new Promise((onRes, onErr) => {
            let socket: Socket
            socket = new Socket()

            //Connect
            const Connect = new Promise<void>((res, rej) => {
                socket.connect(port, server, () => {})
                socket.once("data", (data) => {
                    const tmp = data.toString()
                    if (!tmp.startsWith("220")) {
                        onErr(tmp.replace("\r\n", ""))
                    } else {
                        res()
                    }
                })
            })

            const HELO = Connect.then(() => {
                return new Promise<void>((res, rej) => {
                    socket.write(`HELO ${server}\r\n`)
                    socket.once("data", (data) => {
                        if (!data.toString().startsWith("250")) {
                            onErr(data.toString().replace("\r\n", ""))
                        } else {
                            res()
                        }
                    })
                })
            })

            const MAIL = HELO.then(() => {
                return new Promise<void>((res, rej) => {
                    socket.write(`MAIL FROM:<${from}>\r\n`)
                    socket.once("data", (data) => {
                        if (!data.toString().startsWith("250")) {
                            onErr(data.toString().replace("\r\n", ""))
                        } else {
                            res()
                        }
                    })
                })
            })

            const RCPT = MAIL.then(() => {
                return new Promise<void>(async (res, rej) => {
                    for (let v of to) {
                        await new Promise<void>((res1, rej1) => {
                            socket.write(`RCPT TO:<${v}>\r\n`)
                            socket.once("data", (data) => {
                                if (
                                    !(
                                        data.toString().startsWith("250") ||
                                        data.toString().startsWith("251")
                                    )
                                ) {
                                    onErr(data.toString().replace("\r\n", ""))
                                } else {
                                    res1()
                                }
                            })
                        })
                    }
                    res()
                })
            })

            const DATA = RCPT.then(() => {
                return new Promise<void>((res, rej) => {
                    socket.write(`DATA\r\n`)
                    socket.once("data", (data) => {
                        if (!data.toString().startsWith("354")) {
                            onErr(data.toString().replace("\r\n", ""))
                        } else {
                            res()
                        }
                    })
                })
            })

            const WRITE_CONTENT = DATA.then(() => {
                return new Promise<void>((res, rej) => {
                    socket.write(`${content}\r\n.\r\n`)
                    socket.once("data", (data) => {
                        if (!data.toString().startsWith("250")) {
                            onErr(data.toString().replace("\r\n", ""))
                        } else {
                            res()
                        }
                    })
                })
            })

            WRITE_CONTENT.then(onRes)
        })
    }
}

export { POP3Wrapper, SMTPWrapper }
export type { STATResult, UIDLResult }
