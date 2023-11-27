import fs from "node:fs"
import { type RawEmail } from "./types"

const dbPath = "email.sqlite"
fs.writeFileSync(dbPath, "", { flag: "a+" })
const filebuffer = fs.readFileSync(dbPath)

type SuccessCB_T = (mails?: [number, string, string, number][]) => void
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
    new URL("./worker.sql-wasm.js", import.meta.url),
)

const saveDBId = 999
export function SaveDB() {
    dbWorker.postMessage({
        id: saveDBId,
        action: "export",
    })
}

window.addEventListener("beforeunload", SaveDB)

dbWorker.onmessage = () => {
    // console.log("Database opened")
    dbWorker.onmessage = (event) => {
        // console.log(event.data)
        if (event.data.id == saveDBId) {
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
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `
            CREATE TABLE IF NOT EXISTS Inbox (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uidl TEXT UNIQUE NOT NULL,
                timestamp TIMESTAMP NOT NULL DEFAULT (DATETIME('now')),
                content TEXT NOT NULL,
                read BOOLEAN NOT NULL DEFAULT FALSE
            );
            CREATE UNIQUE INDEX IF NOT EXISTS uidl_index ON Inbox(uidl);
    
            CREATE TABLE IF NOT EXISTS Sent (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP NOT NULL DEFAULT (DATETIME('now')),
                content TEXT NOT NULL
            );`,
        })
        successCb[id] = res as SuccessCB_T
        errorCb[id] = rej
    })
}

export function addRawEmail(rawEmail: RawEmail, date?: Date): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        let query = ""
        if (date) {
            query = `INSERT INTO Inbox (id, uidl, content) VALUES ($id, $uidl, $content)`
        } else {
            query = `INSERT INTO Inbox (id, uidl, timestamp, content) VALUES ($id, $uidl, $date, $content)`
        }
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: query,
            params: {
                $id: rawEmail.id,
                $uidl: rawEmail.uidl,
                $content: rawEmail.content,
                $date: date,
            },
        })
        successCb[id] = () => {
            console.log(id, addRawEmail.name)
            onSuccess()
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, addRawEmail.name, e)
            onError(e)
        }
    })
}

export function sendEmail(content: string): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `INSERT INTO Sent (content) VALUES ($content)`,
            params: {
                $content: content,
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

export function deleteEmail(emailIDs: number[]): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `DELETE FROM TABLE Inbox WHERE id IN (${emailIDs.join(",")})`,
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

export function deleteSentEmail(emailIDs: number[]): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `DELETE FROM TABLE Sent WHERE id IN (${emailIDs.join(",")})`,
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

export function getEmails(limit: number, offset: number): Promise<RawEmail[]> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT id, uidl, content, read FROM Inbox ORDER BY DATE(Inbox.timestamp) LIMIT $limit OFFSET $offset`,
            params: {
                $limit: limit,
                $offset: offset,
            },
        })
        successCb[id] = (data?: [number, string, string, number][]) => {
            console.log(id, getEmails.name, data)
            onSuccess(
                data!.map((val) => ({
                    id: val[0],
                    uidl: val[1],
                    content: val[2],
                    read: val[3] == 1,
                })),
            )
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, getEmails.name, e)
            onError(e)
        }
    })
}

export function getSentEmails(
    limit: number,
    offset: number,
): Promise<RawEmail[]> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `SELECT id, content FROM Sent ORDER BY DATE(Sent.timestamp) LIMIT $limit OFFSET $offset`,
            params: {
                $limit: limit,
                $offset: offset,
            },
        })
        successCb[id] = ((data?: [number, string, number][]) => {
            console.log(id, getSentEmails.name, data)
            onSuccess(
                data!.map((val) => ({
                    id: val[0],
                    uidl: "",
                    content: val[1],
                    read: true,
                })),
            )
        }) as unknown as SuccessCB_T

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
        successCb[id] = ((res: [[number]]) => {
            console.log(id, countMail.name, res)
            onSuccess(res[0][0])
        }) as unknown as SuccessCB_T
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
        successCb[id] = (rawEmail?: [number, string, string, number][]) => {
            console.log(id, findUIDL.name, rawEmail)
            onSuccess(!!rawEmail)
        }
        // errorCb[id] = onError
        errorCb[id] = (e) => {
            console.log(id, findUIDL.name, e)
            onError(e)
        }
    })
}

export function read(id: number): Promise<void> {
    return new Promise((onSuccess, onError) => {
        const id = getQueryID()
        dbWorker.postMessage({
            id: id,
            action: "exec",
            sql: `UPDATE Inbox SET read = TRUE WHERE id = $id`,
            params: {
                $id: id,
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
