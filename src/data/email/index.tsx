import { Dispatch, useState, useCallback, useEffect } from "react"
import { Config, Filter } from "../config"
import {
    type Email,
    type FilteredMailBox,
    type Attachment,
    RawEmail,
} from "./types"
import { MailBuilder } from "./MailBuilder"
import {
    setupDB,
    addRawEmail,
    sendEmail,
    deleteEmail,
    deleteSentEmail,
    findUIDL,
    SaveDB,
    getEmails,
    getSentEmails,
    read,
    updateListID,
    getListID,
    deleteNotIn,
} from "./db"
import { POP3Wrapper, SMTPWrapper, UIDLResult } from "@/socket"
import { getDate, parseEmail } from "./parser"

type MailBoxState = {
    mailBox: FilteredMailBox
    state: "loading" | "success" | "failed"
    error: string | null
    page: number
    sentPage: number
}

const EActionKind = {
    Send: "Send",
    Delete: "Delete",
    DeleteSend: "DeleteSend",
    Refresh: "Refresh",
    Get: "Get",
    More: "More",
    MoreSent: "MoreSent",
} as const

type ActionKind = (typeof EActionKind)[keyof typeof EActionKind]

type ActionType =
    | {
          action: "Send"
          payload: MailBuilder
      }
    | {
          action: "Delete"
          payload: string
      }
    | {
          action: "Refresh"
      }
    | { action: "Get" }
    | { action: "More" }
    | { action: "MoreSent" }
    | { action: "Read"; payload: string }
    | { action: "Unread"; payload: string }
    | {
          action: "DeleteSend"
          payload: number[]
      } // & { onSuccess?: () => void; onError?: (err: string) => void }

function useMailBoxReducer(config: Config) {
    const [mailBoxState, setMailBoxState] = useState<MailBoxState>({
        mailBox: {},
        state: "loading",
        error: null,
        page: 1,
        sentPage: 1,
    })

    const filterAndAdd = useCallback(
        (
            mails: Email[] | null,
            sents: Email[] | null,
            eraseOld: boolean,
            config: Config,
        ) => {
            const old: FilteredMailBox = {}
            console.log("From filter and Add", config)
            if (mails != null) {
                if (eraseOld) {
                    for (let filter of config.filters) {
                        old[filter.name] = []
                    }
                    old["Inbox"] = []
                    old["Sent"] = []
                } else {
                    for (let filter of config.filters) {
                        old[filter.name] = [
                            ...mailBoxState.mailBox[filter.name],
                        ]
                    }
                    old["Inbox"] = [...mailBoxState.mailBox["Inbox"]]
                    old["Sent"] = [...mailBoxState.mailBox["Sent"]]
                }
                for (let i = 0; i < mails.length; i++) {
                    let found = false
                    for (let filter of config.filters) {
                        if (match(mails[i], filter)) {
                            old[filter.name].push(mails[i])
                            found = true
                            break
                        }
                    }
                    if (!found) {
                        old["Inbox"].push(mails[i])
                    }
                }
            }
            if (sents != null) {
                old["Sent"].push(...sents)
            }
            return old
        },
        [config],
    )

    const setFail = useCallback(
        (e: string) => {
            console.error(e)
            setMailBoxState((old) => ({
                ...old,
                state: "failed",
                error: e,
            }))
        },
        [setMailBoxState],
    )

    const mailBoxDispatch = useCallback(
        async (action: ActionType) => {
            if (!config.server.length) {
                return
            }
            setMailBoxState((old) => ({
                ...old,
                state: "loading",
                error: null,
            }))

            switch (action.action) {
                case "Refresh":
                    {
                        const POP3 = new POP3Wrapper()
                        await POP3.connect(config.server, config.POP3port)
                        await POP3.USER(config.username)
                        await POP3.PASS(config.password)
                        try {
                            let newMails: RawEmail[] = []
                            const uids = await POP3.UIDL()
                            await deleteNotIn(uids.map((val) => val.uid))
                            for (let uid of uids) {
                                if (!(await findUIDL(uid.uid))) {
                                    const mail = {
                                        id: uid.id,
                                        uidl: uid.uid,
                                        content: await POP3.RETR(uid.id),
                                        read: false,
                                    } satisfies RawEmail
                                    newMails.push(mail)
                                    await addRawEmail(
                                        mail,
                                        getDate(mail.content),
                                    )
                                } else {
                                    updateListID(uid.uid, uid.id)
                                }
                            }
                        } catch (e) {
                            setFail(String(e))
                        }
                        POP3.destroy()
                        SaveDB()
                        mailBoxDispatch({ action: "Get" })
                    }
                    break
                case "Send":
                    {
                        const SMTP = new SMTPWrapper()
                        const mail = action.payload.toString()
                        SMTP.send(
                            config.server,
                            config.POP3port,
                            action.payload.getSender(),
                            action.payload.getReceivers(),
                            mail,
                        )
                            .then(() => {
                                sendEmail(mail)
                                    .then(() => {
                                        mailBoxDispatch({
                                            action: "Get",
                                        })
                                    })
                                    .catch(setFail)
                            })
                            .catch(setFail)
                    }
                    break
                case "Delete":
                    {
                        const listID = await getListID(action.payload)
                        const POP3 = new POP3Wrapper()
                        await POP3.connect(config.server, config.POP3port)
                        await POP3.USER(config.username)
                        await POP3.PASS(config.password)
                        await POP3.DELE(listID).catch((e) => {
                            POP3.destroy()
                            setFail(e)
                        })
                        POP3.destroy()
                        deleteEmail(action.payload)
                            .then(() => {
                                mailBoxDispatch({ action: "Get" })
                            })
                            .catch(setFail)
                    }
                    break
                case "DeleteSend":
                    deleteSentEmail(action.payload)
                        .then(() => {
                            mailBoxDispatch({ action: "Get" })
                        })
                        .catch(setFail)
                    break
                case "Get":
                    try {
                        const rawMails = await getEmails(25, 0)
                        console.info("ok")
                        const parsedMails = rawMails.map((rawMail) =>
                            parseEmail(rawMail),
                        )
                        console.info("ok")
                        const sentMails = await getSentEmails(25, 0).then(
                            (data) => data.map((value) => parseEmail(value)),
                        )
                        console.info("ok")
                        const newState = filterAndAdd(
                            parsedMails,
                            sentMails,
                            true,
                            config,
                        )
                        console.info("ok")
                        setMailBoxState((old) => ({
                            mailBox: newState,
                            state: "success",
                            error: null,
                            page: 1,
                            sentPage: 1,
                        }))
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "More":
                    try {
                        const rawMails = await getEmails(
                            mailBoxState.page * 25,
                            (mailBoxState.page - 1) * 25,
                        )
                        const parsedMails = rawMails.map((rawMail, index) => {
                            const parsed = parseEmail(rawMail)
                            return parsed
                        })
                        const newState = filterAndAdd(
                            parsedMails,
                            null,
                            false,
                            config,
                        )
                        setMailBoxState((old) => ({
                            mailBox: newState,
                            state: "success",
                            error: null,
                            page: old.page + 1,
                            sentPage: 1,
                        }))
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "MoreSent":
                    try {
                        const rawMails = await getSentEmails(
                            mailBoxState.page * 25,
                            (mailBoxState.page - 1) * 25,
                        )
                        const parsedMails = rawMails.map((rawMail, index) => {
                            const parsed = parseEmail(rawMail)
                            return parsed
                        })
                        const newState = filterAndAdd(
                            null,
                            parsedMails,
                            false,
                            config,
                        )
                        setMailBoxState((old) => ({
                            mailBox: newState,
                            state: "success",
                            error: null,
                            page: old.page + 1,
                            sentPage: 1,
                        }))
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "Read":
                    try {
                        await read(action.payload)
                    } catch (e) {
                        setFail(String(e))
                    }
                    mailBoxDispatch({ action: "Get" })
                    break
                case "Unread":
                    try {
                        await read(action.payload)
                    } catch (e) {
                        setFail(String(e))
                    }
                    mailBoxDispatch({ action: "Get" })
                    break
                default:
                    break
            }
        },
        [setMailBoxState, config],
    )

    useEffect(() => {
        setupDB().then(() => {
            mailBoxDispatch({ action: "Get" })
        })
    }, [])

    useEffect(() => {
        if (config.server.length) {
            mailBoxDispatch({ action: "Refresh" })
            const tmp = setInterval(
                () => mailBoxDispatch({ action: "Refresh" }),
                config.pullInterval * 1000,
            )
            return () => clearInterval(tmp)
        }
        return () => {}
    }, [config])

    return [mailBoxState, mailBoxDispatch] as [
        MailBoxState,
        Dispatch<ActionType>,
    ]
}

function match(mail: Email, filter: Filter): boolean {
    if (filter.rule.mail.length)
        for (let str of filter.rule.mail) {
            if (mail.sender.includes(str)) {
                return true
            }
        }
    if (filter.rule.subject.length)
        for (let str of filter.rule.subject) {
            if (mail.subject.includes(str)) {
                return true
            }
        }
    if (filter.rule.content.length)
        for (let str of filter.rule.content) {
            if (mail.content.innerText.includes(str)) {
                return true
            }
        }
    return false
}

export { useMailBoxReducer, MailBuilder }
export type { ActionType, ActionKind, Email, FilteredMailBox, Attachment }
