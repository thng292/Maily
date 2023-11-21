import { POP3Wrapper, SMTPWrapper } from "@/socket"
import { useEffect, Dispatch, useState, useCallback } from "react"
import { Config, Filter } from "../config"

type Email = {
    id: number
    uidl: string
    replyTo: string | null
    sentTime: Date
    sender: string
    receiver: string
    subject: string
    content: HTMLElement
    isSent: boolean
}

type FilteredMailBox = { [key: string]: Email[] }

type MailBoxState = {
    mailBox: FilteredMailBox
    loading: boolean
    success: boolean
    error: string
}

const EActionKind = {
    Send: "Send",
    Delete: "Delete",
    Refresh: "Refesh",
} as const

type ActionKind = (typeof EActionKind)[keyof typeof EActionKind]

type ActionType = (
    | {
          action: "Send"
          payload: Email
      }
    | {
          action: "Delete"
          payload: number[]
      }
    | {
          action: "Refesh"
      }
) & { onError: (err: string) => void }

function useMailBoxReducer(config: Config) {
    const [mailBoxState, setMailBoxState] = useState<MailBoxState>({
        mailBox: {},
        loading: true,
        success: false,
        error: "",
    })

    const mailBoxDispatch = useCallback(
        (action: ActionType) => {
            switch (action.action) {
                case "Refesh":
                    break
                case "Send":
                    break
                case "Delete":
                    break
                default:
                    break
            }
        },
        [config],
    )

    useEffect(() => {
        const tmp = setInterval(() => {
            mailBoxDispatch({ action: "Refesh" })
        }, config.pullInterval * 1000)
    }, [config])

    // useEffect(() => {
    //     console.log(mailBox)
    //     let res: FilteredMailBox = { Inbox: [] }
    //     for (let filter of config.filters) {
    //         res[filter.name] = []
    //     }
    //     for (let i = 0; i < mailBox.length; i++) {
    //         for (let filter of config.filters) {
    //             if (match(mailBox[i], filter)) {
    //                 res[filter.name].push(mailBox[i])
    //             } else {
    //                 res["Inbox"].push(mailBox[i])
    //             }
    //         }
    //     }
    //     res["Inbox"].push(...mailBox)
    //     // Add Sent
    //     res["Sent"].push(...[])
    //     setMailBoxState((prev) => {
    //         return { ...prev, mailBox: res }
    //     })
    // }, [mailBox, config])

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

export { useMailBoxReducer }
export type { Email, ActionType, ActionKind }
