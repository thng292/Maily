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

    //Neu goi th connect nay ma tra ve false thi goi lai, khong can QUIT
    connect(server: string, port: number): Promise<void> {
        // this.socket.connect(port, server, () => {
        //     console.log(`connecting`)
        // })
        // this.socket.on("data", (data) => {
        //     if (data.toString().startsWith("+OK")) {
        //         return true
        //     }
        //     if (data.toString().startsWith("-ERR")) {
        //         console.error(`POP3 connect reply ` + data.toString())
        //         this.QUIT()
        //         return false
        //     }
        // })
        // this.socket.on("error", () => {
        //     console.error(`POP3 connect error \r\n`)
        //     this.socket.end()
        //     return false
        // })
        // return false

        return new Promise<void>((onRes, onErr) => {
            // Dien code vo day
        })
    }

    USER(username: string): Promise<void> {
        // this.socket.write(`USER ${username}\r\n`)
        // this.socket.on("data", (data) => {
        //     if (data.toString().startsWith("+OK")) {
        //         return true
        //     }
        //     if (data.toString().startsWith("-ERR")) {
        //         console.error(`connect USER ` + data.toString())
        //         return false
        //     }
        // })
        // this.socket.on("error", () => {
        //     console.error(`USER error \r\n`)
        //     return null
        // })
        // return false

        return new Promise((onRes, onErr) => {
            // Code
        })
    }

    PASS(password: string): Promise<void> {
        // this.socket.write(`PASS ${password}\r\n`)
        // this.socket.on("data", (data) => {
        //     if (data.toString().startsWith("+OK")) {
        //         return true
        //     }
        //     if (data.toString().startsWith("-ERR")) {
        //         console.error(`PASS reply ` + data.toString())
        //         return false
        //     }
        // })
        // this.socket.on("error", () => {
        //     console.error(`PASS error \r\n`) return null
        // })
        // return false

        return new Promise((onRes, onErr) => {
            // Code
        })
    }

    STAT(): Promise<STATResult[]> {
        // let re: string[]
        // this.socket.write("STAT\r\n")
        // this.socket.on("data", (data) => {
        //     if (data.toString().startsWith("+OK")) {
        //         re = data.toString().replace("\r\n", " ").split(" ")
        //         re.shift()
        //         re.pop()
        //         return re
        //     }
        // })
        // this.socket.on("error", () => {
        //     console.error(`STAT error \r\n`)
        //
        //     return null
        // })
        // return []

        return new Promise((onRes, onErr) => {
            // Code
        })
    }

    UIDL(msgNumber?: number): Promise<UIDLResult[]> {
        // let re: string[]
        // if (msgNumber == undefined) {
        //     this.socket.write("UIDL\r\n")
        //     this.socket.on("data", (data) => {
        //         if (data.toString().startsWith("+OK")) {
        //             re = data.toString().replaceAll("\r\n", " ").split(" ")
        //             re.pop()
        //             re.pop()
        //             re.shift()
        //             return re
        //         }
        //         if (data.toString().startsWith("-ERR")) {
        //             console.error(`UIDL reply ` + data.toString())
        //
        //             return []
        //         }
        //     })
        //     this.socket.on("error", () => {
        //         console.error(`UIDL error \r\n`)
        //         return null
        //     })
        // } else {
        //     this.socket.write(`UIDL ${msgNumber}\r\n`)
        //     this.socket.on("data", (data) => {
        //         if (data.toString().startsWith("+OK")) {
        //             re = data.toString().split(" ")
        //             re.pop()
        //             re.shift()
        //             return re
        //         }
        //         if (data.toString().startsWith("-ERR")) {
        //             console.error(`UIDL ${msgNumber} reply ` + data.toString())
        //
        //             return []
        //         }
        //     })
        //     this.socket.on("error", () => {
        //         console.error(`UIDL ${msgNumber} error\r\n`)
        //         return null
        //     })
        // }
        // return []

        return new Promise((onRes, onErr) => {
            // Code
        })
    }

    RETR(msgNumber: number): Promise<string> {
        // this.socket.write(`RETR ${msgNumber}\r\n`)
        // this.socket.on("data", (data) => {
        //     if (data.toString().startsWith("+OK")) {
        //         return data.toString().replace("+OK\r\n", "")
        //     }
        //     if (data.toString().startsWith("-ERR")) {
        //         console.error(`RETR reply ` + data.toString())
        //         return ""
        //     }
        // })
        // this.socket.on("error", () => {
        //     console.error(`RETR error \r\n`)
        //
        //     return null
        // })
        // return ""

        return new Promise((onRes, onErr) => {
            // Code
        })
    }

    DELE(msgNumber: number): Promise<void> {
        // this.socket.write(`DELE ${msgNumber}\r\n`)
        // this.socket.on("data", (data) => {
        //     if (data.toString().startsWith("+OK")) {
        //         return true
        //     }
        //     if (data.toString().startsWith("-ERR")) {
        //         console.error(`DELE reply ` + data.toString())
        //         return false
        //     }
        // })
        // this.socket.on("error", () => {
        //     console.error(`DELE error \r\n`)
        //
        //     return null
        // })
        // return false

        return new Promise((onRes, onErr) => {
            // Code
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
        // // Ket noi + gui + ngat ket noi
        // // neu ket noi hay gui bi loi thi return false

        // // Ham dong ket noi
        // function close() {
        //     socket.write("QUIT\r\n")
        //     socket.on("data", (data) => {
        //         if (!data.toString().startsWith("221")) {
        //             console.error(data.toString())
        //         }
        //     })
        //     socket.end()
        // }

        // var socket: Socket
        // socket = new Socket()

        // //////////////////////////////////////////////////////////////////////////
        // //Cac phuong thuc ben duoi:
        // //Phan hoi lai loi se in ra:   ten command + "reply" + loi
        // //Neu loi qua trinh (khong phai phan hoi) se in ra:  ten command + "error"
        // //////////////////////////////////////////////////////////////////////////

        // //Tao ket noi
        // socket.connect(port, server, () => {
        //     console.log("Connecting")
        // })
        // //Xu ly reply
        // socket.on("data", (data) => {
        //     if (!data.toString().startsWith("220")) {
        //         console.error(`SMTP connect reply ` + data.toString())
        //         close()
        //         return false
        //     }
        // })
        // //Xu ly loi
        // socket.on("error", () => {
        //     console.error(`SMTP connect error \r\n`)
        //     socket.end()
        //     return false
        // })

        // //HELO
        // socket.write(`HELO ${from}\r\n`)
        // socket.on("data", (data) => {
        //     if (!data.toString().startsWith("250")) {
        //         console.error(`HELO reply ` + data.toString())

        //         close()
        //         return false
        //     }
        // })
        // socket.on("error", () => {
        //     console.error(`HELO error \r\n`)
        //     close()
        //     return false
        // })

        // //MAIL
        // socket.write(`MAIL FROM:<${from}>\r\n`)
        // socket.on("data", (data) => {
        //     if (!data.toString().startsWith("250")) {
        //         console.error(`MAIL reply ` + data.toString())

        //         close()
        //         return false
        //     }
        // })
        // socket.on("error", () => {
        //     console.error(`MAIL error\r\n`)
        //     close()
        //     return false
        // })

        // //RCPT
        // for (let v of to) {
        //     socket.write(`RCPT TO:<${v}>\r\n`)
        //     socket.on("data", (data) => {
        //         if (
        //             !(
        //                 data.toString().startsWith("250") ||
        //                 data.toString().startsWith("251")
        //             )
        //         ) {
        //             console.error(`RCPT <${v}> reply ` + data.toString())
        //             close()
        //             return false
        //         }
        //     })
        //     socket.on("error", () => {
        //         console.error(`RCPT <${v}> error\r\n`)
        //         close()
        //         return false
        //     })
        // }

        // //DATA
        // socket.write(`DATA\r\n`)
        // socket.on("data", (data) => {
        //     if (!data.toString().startsWith("354")) {
        //         console.error(`DATA reply ` + data.toString())
        //         close()
        //         return false
        //     }
        // })
        // socket.on("error", () => {
        //     console.error(`DATA error\r\n`)
        //     close()
        //     return false
        // })
        // //WRITE CONTENT
        // socket.write(`${content}\r\n.\r\n`)
        // socket.on("data", (data) => {
        //     if (!data.toString().startsWith("250")) {
        //         console.error(`WRITE CONTENT reply ` + data.toString())
        //         close()
        //         return false
        //     }
        // })
        // socket.on("error", () => {
        //     console.error(`WRITE CONTENT error\r\n`)
        //     close()
        //     return false
        // })

        // return true

        return new Promise((onRes, onErr) => {
            // Code
        })
    }
}

export { POP3Wrapper, SMTPWrapper }
export type { STATResult, UIDLResult }
