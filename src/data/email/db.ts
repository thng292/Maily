import fs from "node:fs"

const dbPath = "email.sqlite"
fs.writeFileSync(dbPath, "", { flag: "a+" })
const filebuffer = fs.readFileSync(dbPath)

let successCb: ((mails?: RawEmail[]) => void)[] = []
let errorCb: ((e: string) => void)[] = []
const getQueryID = (() => {
    let count = 0
    return () => {
        count = (count + 1) % 128
        return count
    }
})()

export type RawEmail = {
    uidl: string
    content: string
}

export const dbWorker = new Worker(
    new URL("./worker.sql-wasm.js", import.meta.url),
)

dbWorker.onmessage = () => {
    console.log("Database opened")
    dbWorker.onmessage = (event) => {
        console.log(event.data) // The result of the query
        if (!event.data.error) {
            if (successCb[event.data.id]) {
                successCb[event.data.id](event.data.results[0].values)
            }
        } else {
            if (errorCb[event.data.id]) {
                errorCb[event.data.id](event.data.error)
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

export function setupDB() {
    dbWorker.postMessage({
        id: getQueryID(),
        action: "exec",
        sql: `
        CREATE TABLE IF NOT EXISTS Inbox (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uidl TEXT UNIQUE NOT NULL,
            content TEXT not NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS uidl_index ON Inbox(uidl);
    
        CREATE TABLE IF NOT EXISTS Sent (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
              content TEXT not NULL
        );`,
    })
}

export function TestBD() {
    dbWorker.postMessage({
        id: getQueryID(),
        action: "exec",
        sql: `
        INSERT INTO Inbox (uidl, content) VALUES ('SUSSY BAKA', 'TEST')
        `,
    })
    dbWorker.postMessage({
        id: getQueryID(),
        action: "exec",
        sql: `
        SELECT * FROM Inbox
        `,
    })
}

export function addRawEmail(
    rawEmail: RawEmail,
    onSuccess: () => void,
    onError: (e: string) => void,
) {
    const id = getQueryID()
    dbWorker.postMessage({
        id: id,
        action: "exec",
        sql: `INSERT INTO Inbox (uidl, content) VALUES ($uidl, $content)`,
        params: {
            $uidl: rawEmail.uidl,
            $content: rawEmail.content,
        },
    })
    successCb[id] = onSuccess
    errorCb[id] = onError
}

export function sendEmail(
    content: string,
    onSuccess: () => void,
    onError: (e: string) => void,
) {
    const id = getQueryID()
    dbWorker.postMessage({
        id: id,
        action: "exec",
        sql: `INSERT INTO Sent (content) VALUES ($content)`,
        params: {
            $content: content,
        },
    })
    successCb[id] = onSuccess
    errorCb[id] = onError
}

export function deleteEmail(
    emailIDs: number[],
    onSuccess: () => void,
    onError: (e: string) => void,
) {
    const id = getQueryID()
    dbWorker.postMessage({
        id: id,
        action: "exec",
        sql: `DELETE FROM TABLE Inbox WHERE uidl IN (${emailIDs.join(",")})`,
    })
    successCb[id] = onSuccess
    errorCb[id] = onError
}

export function deleteSentEmail(
    emailIDs: number[],
    onSuccess: () => void,
    onError: (e: string) => void,
) {
    const id = getQueryID()
    dbWorker.postMessage({
        id: id,
        action: "exec",
        sql: `DELETE FROM TABLE Sent WHERE uidl IN (${emailIDs.join(",")})`,
    })
    successCb[id] = onSuccess
    errorCb[id] = onError
}

export function getEmails(
    limit: number,
    offset: number,
    onSuccess: (mails: RawEmail[]) => void,
    onError: (e: string) => void,
) {
    const id = getQueryID()
    dbWorker.postMessage({
        id: id,
        action: "exec",
        sql: `SELECT uidl, content FROM Inbox LIMIT $limit OFFSET $offset`,
        params: {
            $limit: limit,
            $offset: offset,
        },
    })
    successCb[id] = onSuccess
    errorCb[id] = onError
}

export function getSentEmails(
    limit: number,
    offset: number,
    onSuccess: (mails: RawEmail[]) => void,
    onError: (e: Error) => void,
) {}
