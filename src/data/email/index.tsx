import { POP3Wrapper, SMTPWrapper } from "@/socket"
import {
    useReducer,
    useEffect,
    Dispatch,
    useMemo,
    useState,
    useCallback,
} from "react"
import { Config, Filter } from "../config"

type Email = {
    uidl: string
    id: string
    replyTo: string
    time: Date
    to: string
    from: string
    subject: string
    content: HTMLElement
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
) & {
    successCB: () => void
    errorCB: (e: string) => void
}

function useMailBoxReducer(config: Config) {
    // const [mailBox, mailBoxDispatch] = useReducer(reducer, [])
    const [mailBox, updateMailBox] = useState<Email[]>([])

    const mailBoxDispatch = useCallback(
        (action: ActionType) => {
            switch (action.action) {
                case "Refesh":
                    updateMailBox(prev => [...prev, 10])
                    break
                default:
                    break
            }
        },
        [config],
    )

    useEffect(() => {
        const tmp = setInterval(() => {mailBoxDispatch()}, config.pullInterval * 1000)
    }, [config])

    const filteredMailBox = useMemo(() => {
        console.log(mailBox)
        let res: FilteredMailBox = { Inbox: [] }
        for (let filter of config.filters) {
            res[filter.name] = []
        }
        for (let i = 0; i < mailBox.length; i++) {
            for (let filter of config.filters) {
                if (match(mailBox[i], filter)) {
                    res[filter.name].push(mailBox[i])
                } else {
                    res["Inbox"].push(mailBox[i])
                }
            }
        }
        res["Inbox"].push(...mailBox)
        // Add Sent
        res["Sent"].push(...[])
        return res
    }, [config, mailBox])

    return [filteredMailBox, mailBoxDispatch] as [
        FilteredMailBox,
        Dispatch<ActionType>,
    ]
}

function match(mail: Email, filter: Filter): boolean {
    for (let str of filter.rule.mail) {
        if (mail.from.includes(str)) {
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
