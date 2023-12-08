import { Attachment } from "./types"

export class MailBuilder {
    #sender: string
    #to: string[]
    #cc: string[]
    #bcc: string[]
    #subject: string
    #content: HTMLElement | null
    #attchments: Attachment[]

    constructor() {
        this.#sender = ""
        this.#to = []
        this.#cc = []
        this.#bcc = []
        this.#subject = ""
        this.#content = null
        this.#attchments = []
    }

    getSender() {
        return this.#sender
    }

    getReceivers() {
        return [...this.#to, ...this.#cc, ...this.#bcc]
    }

    addSender(sender: string) {
        this.#sender = sender
        return this
    }

    addReceiver(receiver: string[]) {
        this.#to.push(...receiver)
        return this
    }

    addCC(receiver: string[]) {
        this.#cc.push(...receiver)
        return this
    }

    addBCC(receiver: string[]) {
        this.#bcc.push(...receiver)
        return this
    }

    addAttachment(attchments: Attachment[]) {
        this.#attchments.push(...attchments)
        return this
    }

    addSubject(subject: string) {
        this.#subject = subject
        return this
    }

    addContent(content: HTMLElement) {
        this.#content = content
        return this
    }

    toString(): string {
        const messageID =
            "Message-ID: <" +
            window.crypto.randomUUID() +
            "@" +
            this.#sender +
            ">"
        const date = "Date: " + new Date().toUTCString()
        const MIME_V = "MIME-Version: 1.0"
        const from = this.#sender.length ? `From: <${this.#sender}>` : null
        const to = this.#to.length ? `To: ${this.#to.join(", ")}` : null
        const cc = this.#cc.length ? `CC: ${this.#cc.join(", ")}` : null
        const subject = `Subject: ${this.#subject}`
        let textContent: string | null = null

        if (this.#content) {
            let tmp = document.createElement("html")
            let head = document.createElement("head")
            head.innerHTML =
                '<meta http-equiv="content-type" content="text/html; charset=UTF-8">'
            tmp.appendChild(head)
            let body = document.createElement("body")
            body.appendChild(this.#content)
            tmp.appendChild(body)
            textContent =
                "<!DOCTYPE html>\r\n<html>\r\n" +
                tmp.innerHTML.replaceAll("\n", "\r\n") +
                "\r\n</html>\r\n\r\n"
        } else {
            this.#content = document.createElement("p")
            textContent = ""
        }

        let res = [messageID, date, MIME_V, subject, from, to, cc]

        const mimeBoudary = [generateMimeBoundary(), generateMimeBoundary()]

        const fillContentIn = (addMimeMessage: boolean) => {
            let tmp = ""
            if (this.#content) {
                tmp += `Content-Type: multipart/alternative; boundary="${mimeBoudary[1]}"\r\n`
                if (addMimeMessage) {
                    tmp +=
                        "\r\nthis is a multi-part message in MIME format.\r\n"
                }
                tmp += "--" + mimeBoudary[1] + "\r\n"
                tmp +=
                    "Content-Type: text/plain; charset=UTF-8; format=flowed\r\n"
                tmp += "Content-Transfer-Encoding: 7bit\r\n\r\n"
                tmp += this.#content.textContent + "\r\n\r\n"
                tmp += "--" + mimeBoudary[1] + "\r\n"
                tmp += "Content-Type: text/html; charset=UTF-8;\r\n"
                tmp += "Content-Transfer-Encoding: 7bit\r\n\r\n"
                tmp += textContent
                tmp += "--" + mimeBoudary[1] + "--\r\n"
            }

            if (this.#attchments) {
                for (let item of this.#attchments) {
                    tmp += "--" + mimeBoudary[0] + "\r\n"
                    tmp += `Content-Type: ${item.mime}; name="${item.filename}"\r\n`
                    tmp += `Content-Disposition: attachment; filename="${item.filename}"\r\n`
                    tmp += "Content-Transfer-Encoding: base64\r\n\r\n"
                    for (let i = 0; i < item.contentBase64.length; i += 70) {
                        tmp += item.contentBase64.slice(i, i + 70) + "\r\n"
                    }
                    tmp += "\r\n\r\n"
                }
            }

            return tmp
        }

        if (this.#content && this.#attchments.length) {
            const mimeHeader = `Content-Type: multipart/mixed; boundary="${mimeBoudary[0]}"`
            res = [
                mimeHeader,
                ...res,
                "\r\nThis is a multi-part message in MIME format.",
                "--" + mimeBoudary[0],
                fillContentIn(false),
                "--" + mimeBoudary[0] + "--",
            ]
        } else {
            res.push(fillContentIn(true))
        }
        return res.filter((val) => val != null).join("\r\n")
    }
}

function generateMimeBoundary() {
    let result = ""
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const charactersLength = characters.length
    let counter = 0
    while (counter < 24) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        )
        counter += 1
    }
    return result.padStart(36, "-")
}
