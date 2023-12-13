import fs from "node:fs"
import { type Email, type EmailMeta } from "./types"
import { Filter } from "../config"
import { parseEmail } from "./parser"
import { MailBuilder } from "./MailBuilder"

const dbPath = "email.sqlite"
const pageSize = 50
fs.writeFileSync(dbPath, "", { flag: "a+" })
let filebuffer = fs.readFileSync(dbPath)

type SuccessCB_T = (mails?: (number | string)[][]) => void
type ErrorCB_T = (e: string) => void

let successCb: (SuccessCB_T | undefined)[] = []
let errorCb: (ErrorCB_T | undefined)[] = []
const getQueryID = (() => {
    let count = 0
    return () => {
        count = (count + 1) % 128
        return count
    }
})()

export const dbWorker = new Worker(
    new URL("./worker.sql-asm.js", import.meta.url),
)

const saveDBId = 999
const setupDBID = 128
export function SaveDB() {
    dbWorker.postMessage({
        id: saveDBId,
        action: "export",
    })
}

dbWorker.onmessage = () => {
    console.log("Database opened")
    dbWorker.onmessage = (event) => {
        console.log("DB Result: ", event.data)
        if (event.data.id == setupDBID && !!event.data.error) {
            console.warn("DB is malformed", event.data.error)
            dbWorker.postMessage({
                id: getQueryID(),
                action: "close",
                buffer: filebuffer,
            })
            dbWorker.postMessage({
                id: getQueryID(),
                action: "open",
                buffer: "",
            })
            // setupDB()
            return
        }
        if (event.data.id == saveDBId) {
            console.log("Saved")
            fs.writeFile(dbPath, event.data.buffer, (e) => {
                if (e) console.error(e)
            })
            return
        }
        if (!event.data.error) {
            if (!!successCb[event.data.id]) {
                // @ts-ignore
                successCb[event.data.id](
                    event.data.results[0] ? event.data.results[0].values : [],
                )
                successCb[event.data.id] = undefined
            }
        } else {
            if (!!errorCb[event.data.id]) {
                // @ts-ignore
                errorCb[event.data.id](event.data.error)
                errorCb[event.data.id] = undefined
            }
        }
    }
}

dbWorker.onerror = (e) => console.error("Worker error: ", e)
export function SetWorkerThreadErrorHandle(handle: (err: ErrorEvent) => void) {
    dbWorker.onerror = handle
}

dbWorker.postMessage({
    id: getQueryID(),
    action: "open",
    buffer: filebuffer,
})

export function setupDB(): Promise<void> {
    return new Promise((res, rej) => {
        const id = setupDBID
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `
            CREATE TABLE IF NOT EXISTS Inbox (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                listid INTEGER NOT NULL,
                uidl TEXT UNIQUE NOT NULL,
                timestamp TIMESTAMP NOT NULL DEFAULT (DATETIME('now')),
                sender TEXT NOT NULL,
                subject TEXT NOT NULL,
                preview TEXT NOT NULL,
                content TEXT NOT NULL,
                read BOOLEAN NOT NULL DEFAULT FALSE
            );
            CREATE UNIQUE INDEX IF NOT EXISTS uidl_index ON Inbox(uidl);
    
            CREATE TABLE IF NOT EXISTS Sent (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP NOT NULL DEFAULT (DATETIME('now')),
                receiver TEXT NOT NULL,
                subject TEXT NOT NULL,
                preview TEXT NOT NULL,
                content TEXT NOT NULL
            );`,
        })
        successCb[id] = res as SuccessCB_T
        errorCb[id] = rej
    })
}

export function addEmail(email: Email, rawContent: string): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `INSERT INTO Inbox 
                  (listid, uidl, timestamp, sender, subject, preview, content)
                  VALUES 
                  ($listid, $uidl, $date, $sender, $subject, $preview, $content)`,
            params: {
                $listid: email.id,
                $uidl: email.uidl,
                $date: email.sentTime?.toISOString(),
                $sender: email.sender,
                $subject: email.subject,
                $preview: email.content.innerText,
                $content: rawContent,
            },
        })
        successCb[id] = () => {
            console.log(id, addEmail.name, arguments)
            onSuccess()
        }
        errorCb[id] = (e) => {
            console.log(id, addEmail.name, arguments, e)
            onError(e)
        }
    })
}

export function sendEmail(
    email: MailBuilder,
    rawContent: string,
): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `INSERT INTO Sent (receiver, subject, preview, content) 
                  VALUES ($receiver, $subject, $preview, $content)`,
            params: {
                $receiver: email.getReceivers().join(", "),
                $subject: email.getSubject(),
                $preview: email.getTextContent(),
                $content: rawContent,
            },
        })
        successCb[id] = () => {
            console.log(id, sendEmail.name)
            onSuccess()
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, sendEmail.name, e)
            onError(e)
        }
    })
}

export function deleteEmail(emailID: number): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `DELETE FROM Inbox WHERE id = $id`,
            params: {
                $id: emailID,
            },
        })
        successCb[id] = () => {
            console.log(id, sendEmail.name)
            onSuccess()
        } // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, deleteEmail.name, e)
            onError(e)
        }
    })
}

export function deleteSentEmail(emailID: number): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `DELETE FROM Sent WHERE id = $id)`,
            params: {
                $id: emailID,
            },
        })
        successCb[id] = () => {
            console.log(id, sendEmail.name)
            onSuccess()
        } // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, deleteSentEmail.name, e)
            onError(e)
        }
    })
}

export function getEmails(page: number, filter: Filter): Promise<EmailMeta[]> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        let where: string[] = []
        where.push(
            filter.rule.mail
                .map((val) => `sender LIKE '%${val}%'`)
                .filter((val) => val.length)
                .join(" OR "),
        )
        where.push(
            filter.rule.subject
                .map((val) => `subject LIKE '%${val}%'`)
                .filter((val) => val.length)
                .join(" OR "),
        )
        where.push(
            filter.rule.content
                .map((val) => `preview LIKE '%${val}%'`)
                .filter((val) => val.length)
                .join(" OR "),
        )
        const whereQuery = where.filter((val) => val.length).join(" OR ")
        console.log(
            "Query",
            `SELECT id, timestamp, sender, subject, preview, read 
            FROM Inbox 
            ${whereQuery.trim().length ? `WHERE ${whereQuery}` : ""}
            ORDER BY DATETIME(Inbox.timestamp) DESC 
            LIMIT $limit OFFSET $offset`,
        )
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT id, timestamp, sender, subject, preview, read 
                  FROM Inbox 
                  ${whereQuery.trim().length ? `WHERE ${whereQuery}` : ""}
                  ORDER BY DATETIME(Inbox.timestamp) DESC 
                  LIMIT $limit OFFSET $offset`,
            params: {
                $limit: pageSize,
                $offset: (page - 1) * pageSize,
            },
        })
        successCb[id] = (data) => {
            console.log(id, getEmails.name, data)
            onSuccess(
                data?.map(
                    (val) =>
                        ({
                            id: Number(val[0]),
                            sentTime: new Date(val[1]),
                            sender: String(val[2]),
                            subject: String(val[3]),
                            preview: String(val[4]),
                            read: val[5] != 0,
                        } satisfies EmailMeta),
                ) ?? [],
            )
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, getEmails.name, e)
            onError(e)
        }
    })
}

export function getSentEmails(page: number): Promise<EmailMeta[]> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT id, timestamp, receiver, subject, preview FROM Sent 
                  ORDER BY DATETIME(Sent.timestamp) DESC 
                  LIMIT $limit OFFSET $offset`,
            params: {
                $limit: pageSize,
                $offset: (page - 1) * pageSize,
            },
        })
        successCb[id] = (data) => {
            console.log(id, getSentEmails.name, data)
            onSuccess(
                data?.map(
                    (val) =>
                        ({
                            id: Number(val[0]),
                            sentTime: new Date(val[1]),
                            sender: String(val[2]),
                            subject: String(val[3]),
                            preview: String(val[4]),
                            read: true,
                        } satisfies EmailMeta),
                ) ?? [],
            )
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, getSentEmails.name, e)
            onError(e)
        }
    })
}

// export function delteOldMail(
//     time: number,
//     onSuccess: () => void,
//     onError: (e: string) => void,
// ) {
//     const id = getQueryID()
//     dbWorker.postMessage({
//         id: id,
//         action: "exec",
//         sql: `DELETE FROM Inbox WHERE DATE('now') - timestamp`
//         params: {
//             $time: time,
//         },
//     })
//     successCb[id] = onSuccess
//     errorCb[id] = onError
// }

export function countMail(): Promise<number> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT COUNT(*) FROM Inbox`,
        })
        successCb[id] = (res) => {
            console.log(id, countMail.name, res)
            onSuccess(Number(res?.at(0)?.at(0) ?? 0))
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, countMail.name, e)
            onError(e)
        }
    })
}

export function findUIDL(uidl: string): Promise<boolean> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT uidl FROM Inbox WHERE uidl = $uidl`,
            params: {
                $uidl: uidl,
            },
        })
        successCb[id] = (rawEmail) => {
            console.log(id, findUIDL.name, rawEmail)
            onSuccess(rawEmail != undefined && rawEmail?.length != 0)
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, findUIDL.name, e)
            onError(e)
        }
    })
}

export function read(emailID: number): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `UPDATE Inbox SET read = TRUE WHERE id = $id`,
            params: {
                $id: emailID,
            },
        })
        successCb[id] = () => {
            console.log(id, sendEmail.name)
            onSuccess()
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, read.name, e)
            onError(e)
        }
    })
}
export function unread(emailID: number): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `UPDATE Inbox SET read = FALSE WHERE id = $id`,
            params: {
                $id: emailID,
            },
        })
        successCb[id] = () => {
            console.log(id, unread.name)
            onSuccess()
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, read.name, e)
            onError(e)
        }
    })
}

export function updateListID(uidl: string, listID: number) {
    return new Promise<void>((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `UPDATE Inbox SET listid = $id WHERE uidl = $uid`,
            params: {
                $id: listID,
                $uid: uidl,
            },
        })
        successCb[id] = () => {
            console.log(id, updateListID.name)
            onSuccess()
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, read.name, e)
            onError(e)
        }
    })
}

export function getListID(emailID: number) {
    return new Promise<number>((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT listid FROM Inbox WHERE id = $uid`,
            params: {
                $uid: emailID,
            },
        })
        successCb[id] = (res) => {
            console.log(id, getListID.name)
            onSuccess(Number(res?.at(0)?.at(0)))
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, read.name, e)
            onError(e)
        }
    })
}

export function deleteNotIn(uidls: string[]) {
    return new Promise<void>((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `DELETE FROM Inbox WHERE uidl NOT IN (${uidls
                .map((val) => `'${val}'`)
                .join(",")})`,
        })
        successCb[id] = () => {
            console.log(id, deleteNotIn.name)
            onSuccess()
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, read.name, e)
            onError(e)
        }
    })
}

export function getEmail(emailID: number): Promise<Email> {
    return new Promise((onRes, onErr) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT listid, uidl, content, read FROM Inbox WHERE id = $id`,
            params: {
                $id: emailID,
            },
        })
        successCb[id] = (rows) => {
            console.log(id, getEmail.name)
            if (!rows) {
                return onRes({
                    id: 0,
                    messageId: "",
                    uidl: "",
                    replyTo: null,
                    sentTime: new Date(),
                    sender: "",
                    receiver: [],
                    CC: [],
                    subject: "",
                    content: document.createElement("p"),
                    attachment: [],
                    read: false,
                })
            }
            const data = rows[0]
            onRes(
                parseEmail({
                    id: Number(data[0]),
                    uidl: String(data[1]),
                    content: String(data[2]),
                    read: data[3] != 0,
                }),
            )
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, getEmail.name, e)
            onErr(e)
        }
    })
}

export function getSentEmail(emailID: number): Promise<Email> {
    return new Promise((onRes, onErr) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT id, content FROM Sent WHERE id = $id`,
            params: {
                $id: emailID,
            },
        })
        successCb[id] = (rows) => {
            console.log(id, getEmail.name)
            if (!rows) {
                return onRes({
                    id: 0,
                    messageId: "",
                    uidl: "",
                    replyTo: null,
                    sentTime: new Date(),
                    sender: "",
                    receiver: [],
                    CC: [],
                    subject: "",
                    content: document.createElement("p"),
                    attachment: [],
                    read: false,
                })
            }
            const data = rows[0]
            onRes(
                parseEmail({
                    id: Number(data[0]),
                    uidl: "",
                    content: String(data[1]),
                    read: true,
                }),
            )
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, getSentEmail.name, e)
            onErr(e)
        }
    })
}

export function getInbox(
    page: number,
    otherFilters: Filter[],
): Promise<EmailMeta[]> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        let where: string[] = []
        for (let filter of otherFilters) {
            where.push(
                filter.rule.mail
                    .map((val) => `sender LIKE '%${val}%'`)
                    .filter((val) => val.length)
                    .join(" OR "),
            )
            where.push(
                filter.rule.subject
                    .map((val) => `subject LIKE '%${val}%'`)
                    .filter((val) => val.length)
                    .join(" OR "),
            )
            where.push(
                filter.rule.content
                    .map((val) => `preview LIKE '%${val}%'`)
                    .filter((val) => val.length)
                    .join(" OR "),
            )
        }

        const whereQuery = where.filter((val) => val.length).join(" OR ")
        console.log(
            "Query",
            `SELECT id, timestamp, sender, subject, preview, read 
            FROM Inbox 
            ${whereQuery.trim().length ? `WHERE NOT (${whereQuery})` : ""}
            ORDER BY DATETIME(Inbox.timestamp) DESC 
            LIMIT $limit OFFSET $offset`,
        )
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT id, timestamp, sender, subject, preview, read 
                  FROM Inbox 
                  ${whereQuery.trim().length ? `WHERE NOT (${whereQuery})` : ""}
                  ORDER BY DATETIME(Inbox.timestamp) DESC 
                  LIMIT $limit OFFSET $offset`,
            params: {
                $limit: pageSize,
                $offset: (page - 1) * pageSize,
            },
        })
        successCb[id] = (data) => {
            console.log(id, getInbox.name, data)
            onSuccess(
                data?.map(
                    (val) =>
                        ({
                            id: Number(val[0]),
                            sentTime: new Date(val[1]),
                            sender: String(val[2]),
                            subject: String(val[3]),
                            preview: String(val[4]),
                            read: val[5] != 0,
                        } satisfies EmailMeta),
                ) ?? [],
            )
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, getInbox.name, e)
            onError(e)
        }
    })
}
