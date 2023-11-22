export type Email = {
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

export type FilteredMailBox = { [key: string]: Email[] }

export type RawEmail = {
    uidl: string
    content: string
}
