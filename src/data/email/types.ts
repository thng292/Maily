export type Attachment = {
    filename: string
    mime: string
    contentBase64: string
}

export type Email = {
    id: number
    messageId: string
    uidl: string
    replyTo: string | null
    sentTime: Date
    sender: string
    receiver: string[]
    CC: string[]
    subject: string
    content: HTMLElement
    attachment: Attachment[]
    read: boolean
}

export type FilteredMailBox = { [key: string]: Email[] }

export type RawEmail = {
    id: number
    uidl: string
    content: string
    read: boolean
}
