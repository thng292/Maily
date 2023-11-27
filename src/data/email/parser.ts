import { type Email, type Attachment, type RawEmail } from "./types"

export function getDate(rawMail: string): Date {
    const dateI = rawMail.indexOf("Date: ")
    if (dateI < 0) {
        return new Date()
    }
    const dateStr = rawMail.slice(dateI, rawMail.indexOf("\n", dateI))
    const date = new Date(dateStr)
    // @ts-ignore
    if (!isNaN(date)) {
        return new Date()
    }
    return date
}

export function parseEmail(raw: RawEmail): Email {
    let lines = raw.content.trim().split("\r\n")
    let rawheader: string[] = []
    let rawbody: string[] = []
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] == "") {
            rawheader = lines.slice(0, i)
            rawbody = lines.slice(i + 1)
            break
        }
    }

    const header = parseHeader(rawheader)
    let res = {
        id: raw.id,
        messageId: header["Message-ID"],
        uidl: raw.uidl,
        replyTo: header["In-Reply-To"],
        sentTime: new Date(header["Date"]),
        sender: header["From"],
        receiver: "To" in header ? header["To"].split(", ") : [],
        CC: "CC" in header ? header["CC"].split(", ") : [],
        subject: header["Subject"] ?? null,
        attachment: [],
        read: raw.read,
    } as unknown as Email

    if ("Content-Type" in header) {
        const { subtype, boundary } = parseContentType(header["Content-Type"])
        const body = parseMultipartBody(rawbody.slice(1), boundary, subtype)
        res.content = body.content
        res.attachment = body.attachments
    } else {
        const content = document.createElement("p")
        content.innerText = rawbody.join("")
        res.content = content
    }

    return res
}

function parseHeader(raw: string[]) {
    const header: { [key: string]: string } = {}
    for (let line of raw) {
        if (line.length == 0) {
            break
        }
        if (line.startsWith(" boundary")) {
            header["Content-Type"] += line
        } else {
            const sep = line.indexOf(":")
            header[line.slice(0, sep)] = line.slice(sep + 2)
        }
    }
    return header
}

function parseContentType(raw: string): {
    type: string
    subtype: string
    [key: string]: string
} {
    console.log(parseContentType.name, raw)
    const res: ReturnType<typeof parseContentType> = {
        type: "",
        subtype: "",
    }
    let tmp = raw.split("; ")
    ;[res.type, res.subtype] = tmp[0].split("/")
    tmp = tmp.slice(1)
    for (let attr of tmp) {
        let [key, val] = attr.split("=")
        val = val.replaceAll('"', "")
        res[key] = val
    }
    return res
}

function parseContentDisposition(raw: string): {
    pos: string
    filename: string
} {
    console.log("fuck", raw)
    let [pos, filename] = raw.split("; ")
    filename = filename.split("=")[1].replaceAll('"', "")
    return { pos, filename }
}

function parseMultipartBody(
    raw: string[],
    boundary: string,
    subtype: string,
): { content: HTMLElement; attachments: Attachment[] } {
    console.log(raw)
    const startBound = "--" + boundary
    const endBound = startBound + "--"
    // @ts-ignore
    const res: ReturnType<typeof parseMultipartBody> = { attachments: [] }
    let gotHTML = false
    let parts: string[][] = []
    let buffer: string[] = []
    for (let line of raw) {
        if (line == startBound || line == endBound) {
            if (buffer.length) {
                parts.push(buffer)
                buffer = []
            }
        }
        buffer.push(line)
    }
    console.log(parseMultipartBody.name, parts)
    switch (subtype) {
        case "mixed":
            break
        case "alterative":
            break
        case "html":
            break
        case "plain":
            break
        default:
            break
    }
    return res
}

function parseHTML(raw: string[]): HTMLElement {}

function parsePlain(raw: string[]): string {}

function parseOther(raw: string[]): Attachment {}
