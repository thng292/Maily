import { Socket } from "node:net"

type STATResult = {
    id: number
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
                onErr(data.name)
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
                onErr(data.name)
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
                onErr(data.name)
            })
        })
    }

    STAT(): Promise<STATResult[]> {
        return new Promise((onRes, onErr) => {
            let sub: string[]
            let re: STATResult[]
            this.socket.write("STAT\r\n")
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    sub = data
                        .toString()
                        .replace("+OK ", "")
                        .replace("\r\n", "")
                        .split(" ")
                    for (let i = 0; i < sub.length / 2; i++) {
                        re.push({
                            id: parseInt(sub[i * 2]),
                            size: parseInt(sub[i * 2 + 1]),
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
                onErr(data.name)
            })
        })
    }

    UIDL(msgNumber?: number): Promise<UIDLResult[]> {
        return new Promise((onRes, onErr) => {
            let sub: string[]
            let re: UIDLResult[]
            if (msgNumber == undefined) {
                this.socket.write("UIDL\r\n")
                this.socket.once("data", (data) => {
                    if (data.toString().startsWith("+OK")) {
                        sub = data
                            .toString()
                            .replace("+OK\r\n", "")
                            .replace("\r\n.\r\n", "")
                            .replaceAll("\r\n", " ")
                            .split(" ")
                        for (let i = 0; i < sub.length / 2; i++) {
                            re.push({
                                id: parseInt(sub[i * 2]),
                                uid: sub[i * 2 + 1],
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
                    onErr(data.name)
                })
            } else {
                this.socket.write(`UIDL ${msgNumber}\r\n`)
                this.socket.once("data", (data) => {
                    if (data.toString().startsWith("+OK")) {
                        sub = data
                            .toString()
                            .replace("+OK ", "")
                            .replace("\r\n", "")
                            .split(" ")
                        for (let i = 0; i < sub.length / 2; i++) {
                            re.push({
                                id: parseInt(sub[i * 2]),
                                uid: sub[i * 2 + 1],
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
                    onErr(data.name)
                })
            }
        })
    }

    RETR(msgNumber: number): Promise<string> {
        return new Promise((onRes, onErr) => {
            let sub: string[]
            let re: string
            this.socket.write(`RETR ${msgNumber}\r\n`)
            this.socket.once("data", (data) => {
                if (data.toString().startsWith("+OK")) {
                    sub = data
                        .toString()
                        .replace("\r\n", "---")
                        .replace("\r\n.\r\n", "\r\n")
                        .split("---")
                    re = sub[1]
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
                onErr(data.name)
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
                onErr(data.name)
            })
        })
    }

    QUIT() {
        this.socket.write("QUIT\r\n")
        this.socket.on("data", (data) => {
            if (data.toString().startsWith("-ERR")) {
                console.error(`QUIT reply ` + data.toString())
            }
        })
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
            socket.connect(port, server, () => {})

            socket.on("data", (data) => {
                if (!data.toString().startsWith("220")) {
                    onErr(data.toString().replace("\r\n", ""))
                }
            })

            //HELO
            socket.write(`HELO ${from}\r\n`)
            socket.on("data", (data) => {
                if (!data.toString().startsWith("250")) {
                    onErr(data.toString().replace("\r\n", ""))
                }
            })

            //MAIL
            socket.write(`MAIL FROM:<${from}>\r\n`)
            socket.on("data", (data) => {
                if (!data.toString().startsWith("250")) {
                    onErr(data.toString().replace("\r\n", ""))
                }
            })

            //RCPT
            for (let v of to) {
                socket.write(`RCPT TO:<${v}>\r\n`)
                socket.on("data", (data) => {
                    if (
                        !(
                            data.toString().startsWith("250") ||
                            data.toString().startsWith("251")
                        )
                    ) {
                        onErr(data.toString().replace("\r\n", ""))
                    }
                })
            }

            //DATA
            socket.write(`DATA\r\n`)
            socket.on("data", (data) => {
                if (!data.toString().startsWith("354")) {
                    onErr(data.toString().replace("\r\n", ""))
                }
            })

            //WRITE CONTENT
            socket.write(`${content}\r\n.\r\n`)
            socket.on("data", (data) => {
                if (!data.toString().startsWith("250")) {
                    onErr(data.toString().replace("\r\n", ""))
                }
            })

            //ERROR
            socket.once("error", (data) => {
                onErr(data.name)
            })

            onRes()
        })
    }
}

export { POP3Wrapper, SMTPWrapper }
export type { STATResult, UIDLResult }
