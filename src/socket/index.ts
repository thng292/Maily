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

    constructor(server: string, port: number) {
        // Co loi thi throw nha
        // Tao socket roi connect vo server
        this.socket = new Socket()
    }

    USER(username: string): boolean {
        // ok thi true
        // loi thi false
        return true
    }

    PASS(password: string): boolean {
        // nhu USER
        return true
    }

    STAT(): STATResult[] {
        return []
    }

    UIDL(msgNumber?: number): UIDLResult[] {
        return []
    }

    RETR(msgNumber: number): string | null {
        return ""
    }

    DELE(msgNumber: number): boolean {
        return true
    }

    QUIT() {
        // Ngat ket noi + huy socket
    }
}

class SMTPWrapper {
    send(
        server: string,
        port: number,
        from: string,
        to: string[],
        content: string,
    ): boolean {
        // Ket noi + gui + ngat ket noi
        // neu ket noi hay gui bi loi thi return false
        return true
    }
}

export { POP3Wrapper, SMTPWrapper }
export type { STATResult, UIDLResult }
