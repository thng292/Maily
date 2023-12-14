import { type Email, type Attachment, type RawEmail } from "./types"
const rfc2047 = require("rfc2047")

export function getDate(rawMail: string) {
    const dateI = rawMail.indexOf("Date: ")
    if (dateI < 0) {
        return undefined
    }
    const dateStr = rawMail.slice(dateI + 6, rawMail.indexOf("\n", dateI))
    const date = new Date(dateStr)
    // @ts-ignore
    if (isNaN(date)) {
        return undefined
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

    if (rawheader.length == 0 && rawbody.length == 0) {
        rawbody = lines
    }

    const header = parseHeader(rawheader)
    let res = {
        id: raw.id,
        messageId: header["Message-ID"],
        uidl: raw.uidl,
        replyTo: header["In-Reply-To"],
        sentTime: new Date(header["Date"]),
        sender: rfc2047.decode(header["From"]) ?? "Unknown sender",
        receiver:
            "To" in header ? rfc2047.decode(header["To"]).split(", ") : [],
        CC: "CC" in header ? header["CC"].split(", ") : [],
        subject: rfc2047.decode(header["Subject"]) ?? "No Subject",
        attachment: [],
        read: raw.read,
    } as unknown as Email

    if ("Content-Type" in header) {
        const { subtype, boundary } = parseContentType(header["Content-Type"])
        const body = parseMultipartBody(rawbody.slice(1), boundary, subtype)
        res.content = body.content
        if (!res.content) {
            res.content = document.createElement("div")
        }
        res.attachment = body.attachments
    } else {
        res.content = parsePlain(rawbody)
    }

    return res
}

function parseHeader(raw: string[]) {
    const header: { [key: string]: string } = {}
    let last = ""
    for (let line of raw) {
        if (line.length == 0) break
        if (line.startsWith(" ")) {
            header[last] += line
        } else {
            const sep = line.indexOf(":")
            last = line.slice(0, sep)
            header[last] = line.slice(sep + 2)
        }
    }
    // console.log(parseHeader.name, header)
    // console.log(header)
    return header
}

function parseContentType(raw: string): {
    type: string
    subtype: string
    [key: string]: string
} {
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
    // console.log(parseContentType.name, raw, "=>", res)
    return res
}

function parseContentDisposition(raw: string): {
    pos: string
    filename: string
} {
    // console.log(parseContentDisposition.name, arguments)
    let [pos, filename] = raw.split("; ")
    filename = rfc2047.decode(filename.split("=")[1].replaceAll('"', ""))
    return { pos, filename }
}

function parseMultipartBody(
    raw: string[],
    boundary: string,
    subtype: string,
): { content: HTMLElement; attachments: Attachment[] } {
    // @ts-ignore
    const res: ReturnType<typeof parseMultipartBody> = { attachments: [] }

    console.log(parseMultipartBody.name, arguments)

    function GetParts() {
        const startBound = "--" + boundary
        const endBound = startBound + "--"
        let parts: string[][] = []
        let buffer: string[] = []
        let started = false
        for (let line of raw) {
            if (line == startBound) {
                if (buffer.length) {
                    started && parts.push(buffer)
                    buffer = []
                }
                started = true
            } else if (line == endBound) {
                if (buffer.length) {
                    parts.push(buffer)
                    buffer = []
                }
            } else {
                buffer.push(line)
            }
        }
        parts = parts.filter((val) => val.length)
        console.log(parseMultipartBody.name, "Parts", parts)
        return parts
    }

    switch (subtype) {
        case "mixed":
            {
                const parts = GetParts()
                for (let part of parts) {
                    const header = parseHeader(part)
                    const contentType = parseContentType(header["Content-Type"])
                    const tmp = parseMultipartBody(
                        part,
                        contentType.boundary,
                        contentType.subtype,
                    )
                    if (!res.content) {
                        res.content = tmp.content
                    }
                    res.attachments.push(...tmp.attachments)
                }
            }
            break
        case "alternative":
            {
                // text only
                const parts = GetParts()
                let gotHTML = false

                for (let part of parts) {
                    const header = parseHeader(part)
                    const contentType = parseContentType(header["Content-Type"])
                    const tmp = parseMultipartBody(
                        part.slice(part.indexOf("") + 1),
                        contentType.boundary,
                        contentType.subtype,
                    )
                    if (contentType.subtype == "plain") {
                        if (!gotHTML) {
                            res.content = tmp.content
                        }
                    } else {
                        gotHTML = true
                        res.content = tmp.content
                    }
                }
            }
            break
        case "html":
            {
                res.content = parseHTML(raw)
            }
            break
        case "plain":
            {
                res.content = parsePlain(raw)
            }
            break
        default:
            res.attachments.push(parseOther(raw))
            break
    }
    return res
}

function parseHTML(rawBody: string[]): HTMLElement {
    console.log(
        parseHTML.name,
        rawBody.reduce((prev, current) => prev + current),
    )
    const tmp = document.createElement("div")
    tmp.innerHTML = rawBody.reduce((prev, current) => prev + current)
    return tmp
}

function parsePlain(rawBody: string[]): HTMLElement {
    const content = document.createElement("p")
    content.style.fontFamily = "monospace"
    content.innerText = rawBody.slice(rawBody.indexOf("")).join("\n")
    return content
}

function parseOther(rawWithHeader: string[]): Attachment {
    const header = parseHeader(rawWithHeader)
    const contentType = parseContentType(header["Content-Type"])
    // console.log(parseOther.name, contentType)
    const contentPos = parseContentDisposition(header["Content-Disposition"])
    const res: Attachment = {
        filename: contentPos.filename,
        mime: `${contentType.type}/${contentType.subtype}`,
        contentBase64: "",
    }
    for (let i = rawWithHeader.indexOf(""); i < rawWithHeader.length; i++) {
        res.contentBase64 += rawWithHeader[i].trim()
    }
    return res
}
