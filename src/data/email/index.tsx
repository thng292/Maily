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
    Refresh: "Refesh",
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
          payload: number[]
      }
    | {
          action: "Refesh"
      }
    | { action: "Get" }
    | { action: "More" }
    | { action: "MoreSent" }
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

    function filterAndAdd(
        mails: Email[] | null,
        sents: Email[] | null,
        eraseOld: boolean,
    ) {
        const old = structuredClone(mailBoxState.mailBox)
        console.log(old)
        if (mails != null) {
            if (eraseOld) {
                for (let filter of config.filters) {
                    old[filter.name] = []
                }
                old["Inbox"] = []
                old["Sent"] = []
            }
            console.log(old)
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
    }

    function setFail(e: string) {
        console.error(e)
        setMailBoxState((old) => ({
            ...old,
            state: "failed",
            error: e,
        }))
    }

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
                case "Refesh":
                    {
                        const POP3 = new POP3Wrapper()
                        await POP3.connect(config.server, config.POP3port)
                        await POP3.USER(config.username)
                        await POP3.PASS(config.password)
                        try {
                            let newMails: RawEmail[] = []
                            const uids = await POP3.UIDL()
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
                                }
                            }
                        } catch (e) {
                            setFail(e as string)
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
                        const POP3 = new POP3Wrapper()
                        await POP3.connect(config.server, config.POP3port)
                        await POP3.USER(config.username)
                        await POP3.PASS(config.password)
                        for (let item of action.payload) {
                            await POP3.DELE(item).catch((e) => {
                                POP3.destroy()
                                setFail(e)
                            })
                        }
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
                        const parsedMails = rawMails.map((rawMail) =>
                            parseEmail(rawMail),
                        )
                        console.log(parsedMails)
                        const sentMails = await getSentEmails(25, 0).then(
                            (data) => data.map((value) => parseEmail(value)),
                        )
                        const newState = filterAndAdd(
                            parsedMails,
                            sentMails,
                            true,
                        )
                        console.log(newState)
                        setMailBoxState((old) => ({
                            mailBox: newState,
                            state: "success",
                            error: null,
                            page: 1,
                            sentPage: 1,
                        }))
                    } catch (e) {
                        setFail(e as string)
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
                            parsed.id = index + (mailBoxState.page - 1) * 25
                            return parsed
                        })
                        const newState = filterAndAdd(parsedMails, null, false)
                        setMailBoxState((old) => ({
                            mailBox: newState,
                            state: "success",
                            error: null,
                            page: old.page + 1,
                            sentPage: 1,
                        }))
                    } catch (e) {
                        setFail(e as string)
                    }
                    break
                case "MoreSent":
                    break
                default:
                    break
            }
        },
        [setMailBoxState],
    )

    useEffect(() => {
        setupDB().then(() => {
            mailBoxDispatch({ action: "Refesh" })
        })
    }, [])

    useEffect(() => {
        if (config.server.length) {
            mailBoxDispatch({ action: "Get" })
            const tmp = setInterval(
                () => mailBoxDispatch({ action: "Refesh" }),
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
    for (let str of filter.rule.mail) {
        if (mail.sender.includes(str)) {
            return true
        }
    }
    for (let str of filter.rule.subject) {
        if (mail.subject.includes(str)) {
            return true
        }
    }
    for (let str of filter.rule.content) {
        if (mail.content.innerText.includes(str)) {
            return true
        }
    }
    return false
}

export { useMailBoxReducer, MailBuilder }
export type { ActionType, ActionKind, Email, FilteredMailBox, Attachment }
