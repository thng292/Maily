import { useState, useCallback, useEffect } from "react"
import { Config, Filter } from "../config"
import { type Email, type Attachment, RawEmail, EmailMeta } from "./types"
import { MailBuilder } from "./MailBuilder"
import {
    setupDB,
    addEmail,
    sendEmail,
    getEmail,
    getInbox,
    getSentEmail,
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
    clearDB,
} from "./db"
import { POP3Wrapper, SMTPWrapper, UIDLResult } from "@/socket"
import { parseEmail } from "./parser"

type AllFilter = Filter | { name: "All" } | { name: "Inbox" } | { name: "Sent" }

type MailBoxState = {
    mailBox: EmailMeta[]
    currentFilter: AllFilter
    currentMail: Email | null
    state: "loading" | "success" | "failed"
    error: string | null
    page: number
}

type ActionType =
    | { action: "Refresh" }
    | {
          action: "Get"
          filter?: AllFilter
      }
    | { action: "GetEmail"; id: number }
    | { action: "GetSentEmail"; id: number }
    | { action: "Send"; email: MailBuilder }
    | { action: "Delete"; id: number }
    | { action: "DeleteSend"; id: number }
    | { action: "More" }
    | { action: "Read"; id: number }
    | { action: "Unread"; id: number }
    | { action: "ClearDB" }
// & { onSuccess?: () => void; onError?: (err: string) => void }

function useMailBoxReducer(config: Config) {
    const [mailBoxState, setMailBoxState] = useState<MailBoxState>({
        mailBox: [],
        currentFilter: {
            name: "Inbox",
        },
        currentMail: null,
        state: "loading",
        error: null,
        page: 1,
    })

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
            console.log("Dispatch:", action)
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
                        try {
                            await POP3.connect(config.server, config.POP3port)
                            await POP3.USER(config.username)
                            await POP3.PASS(config.password)
                            const uids = await POP3.UIDL()
                            console.log("UIDS:", uids)
                            await deleteNotIn(uids.map((val) => val.uid))
                            console.log("UIDS:", uids)
                            for (let uid of uids) {
                                console.log("UIDS:", uids)
                                console.log("UID: ", uid)
                                if (!(await findUIDL(uid.uid))) {
                                    const mail = {
                                        id: uid.id,
                                        uidl: uid.uid,
                                        content: await POP3.RETR(uid.id),
                                        read: false,
                                    } satisfies RawEmail
                                    await addEmail(
                                        parseEmail(mail),
                                        mail.content,
                                    ).catch((e) => {
                                        console.error(uid, e)
                                    })
                                } else {
                                    updateListID(uid.uid, uid.id)
                                }
                            }
                            SaveDB()
                            mailBoxDispatch({
                                action: "Get",
                            })
                        } catch (e) {
                            setFail(String(e))
                        }
                        POP3.QUIT()
                        POP3.destroy()
                    }
                    break
                case "Send":
                    {
                        const SMTP = new SMTPWrapper()
                        const mail = action.email.toString()
                        SMTP.send(
                            config.server,
                            config.SMTPport,
                            action.email.getSender(),
                            action.email.getReceivers(),
                            mail,
                        )
                            .then(() => {
                                sendEmail(action.email, mail)
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
                        const listID = await getListID(action.id)
                        const POP3 = new POP3Wrapper()
                        try {
                            await POP3.connect(config.server, config.POP3port)
                            await POP3.USER(config.username)
                            await POP3.PASS(config.password)
                            await POP3.DELE(listID).catch((e) => {
                                POP3.destroy()
                                setFail(e)
                            })
                            POP3.destroy()
                            deleteEmail(action.id).then(() => {
                                setMailBoxState((old) => ({
                                    ...old,
                                    currentMail: null,
                                    state: "success",
                                    error: null,
                                }))
                                mailBoxDispatch({ action: "Get" })
                            })
                        } catch (e) {
                            setFail(String(e))
                        }
                    }
                    break
                case "DeleteSend":
                    deleteSentEmail(action.id)
                        .then(() => {
                            setMailBoxState((old) => ({
                                ...old,
                                currentMail: null,
                            }))
                            mailBoxDispatch({ action: "Get" })
                        })
                        .catch(setFail)
                    break
                case "Get":
                    try {
                        const newFilter =
                            action.filter ?? mailBoxState.currentFilter
                        let rawMails: EmailMeta[] = []
                        switch (newFilter.name) {
                            case "All":
                                rawMails = await getEmails(1, {
                                    name: "",
                                    rule: {
                                        mail: [],
                                        subject: [],
                                        content: [],
                                    },
                                })
                                break
                            case "Inbox":
                                rawMails = await getInbox(1, config.filters)
                                break
                            case "Sent":
                                rawMails = await getSentEmails(1)
                                break
                            default:
                                rawMails = await getEmails(
                                    1,
                                    newFilter as Filter,
                                )
                                break
                        }
                        console.log(rawMails, newFilter)
                        setMailBoxState((old) => ({
                            mailBox: rawMails,
                            currentFilter: newFilter,
                            state: "success",
                            error: null,
                            page: 1,
                            currentMail: old.currentMail,
                        }))
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "More":
                    try {
                        let rawMails: EmailMeta[]
                        switch (mailBoxState.currentFilter.name) {
                            case "All":
                                rawMails = await getEmails(
                                    mailBoxState.page + 1,
                                    {
                                        name: "",
                                        rule: {
                                            mail: [],
                                            subject: [],
                                            content: [],
                                        },
                                    },
                                )
                                break
                            case "Inbox":
                                rawMails = await getInbox(
                                    mailBoxState.page + 1,
                                    config.filters,
                                )
                                break
                            case "Sent":
                                rawMails = await getSentEmails(
                                    mailBoxState.page + 1,
                                )
                                break
                            default:
                                rawMails = await getEmails(
                                    mailBoxState.page + 1,
                                    mailBoxState.currentFilter as Filter,
                                )
                                break
                        }
                        setMailBoxState({
                            mailBox: [...mailBoxState.mailBox, ...rawMails],
                            currentFilter: mailBoxState.currentFilter,
                            state: "success",
                            error: null,
                            page: mailBoxState.page + 1,
                            currentMail: mailBoxState.currentMail,
                        })
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "Read":
                    try {
                        await read(action.id)
                    } catch (e) {
                        setFail(String(e))
                    }
                    SaveDB()
                    mailBoxDispatch({ action: "Get" })
                    break
                case "Unread":
                    try {
                        await read(action.id)
                    } catch (e) {
                        setFail(String(e))
                    }
                    SaveDB()
                    mailBoxDispatch({ action: "Get" })
                    break
                case "GetEmail":
                    try {
                        const email = await getEmail(action.id)
                        setMailBoxState((old) => ({
                            ...old,
                            currentMail: email,
                            state: "success",
                            error: null,
                        }))
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "GetSentEmail":
                    try {
                        const email = await getSentEmail(action.id)
                        setMailBoxState((old) => ({
                            ...old,
                            currentMail: email,
                            state: "success",
                            error: null,
                        }))
                    } catch (e) {
                        setFail(String(e))
                    }
                    break
                case "ClearDB":
                    try {
                        await clearDB()
                        mailBoxDispatch({
                            action: "Refresh",
                        })
                    } catch (e) {
                        setFail(String(e))
                    }
                default:
                    break
            }
        },
        [mailBoxState, setMailBoxState, config],
    )

    useEffect(() => {
        setupDB().then(() => {
            mailBoxDispatch({ action: "Get" })
        })
    }, [])

    useEffect(() => {
        window.floodServer = async () => {
            const { faker } = require("@faker-js/faker")
            console.log("Flooding")
            faker.seed(12345)
            const connection = new SMTPWrapper()
            for (let i = 0; i < 200; i++) {
                const mail = new MailBuilder()
                mail.addSender(faker.internet.email())
                mail.addReceiver([config.username])
                mail.addSubject(faker.lorem.sentence())
                const content = document.createElement("p")
                content.innerText = faker.lorem.paragraphs({ min: 3, max: 10 })
                mail.addContent(content)
                const noImage = faker.number.int({ min: 0, max: 50 }) - 40
                if (noImage > 0) {
                    mail.addAttachment(
                        faker.helpers.multiple(
                            () => ({
                                mime: "image/svg+xml",
                                filename: faker.internet.displayName(),
                                contentBase64: faker.image
                                    .dataUri({
                                        type: "svg-base64",
                                    })
                                    .slice(26),
                            }),
                            {
                                count: noImage,
                            },
                        ),
                    )
                }
                await connection.send(
                    config.server,
                    config.SMTPport,
                    config.username,
                    [config.username],
                    mail.toString(),
                )
            }
            console.log("Flooding Done")
        }

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

    return [mailBoxState, mailBoxDispatch] as const
}

export { useMailBoxReducer, MailBuilder }
export type { ActionType, Email, Attachment, AllFilter }
