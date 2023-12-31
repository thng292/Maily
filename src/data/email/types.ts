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

export type EmailMeta = {
    id: number
    sentTime: Date
    sender: string
    subject: string
    preview: string
    read: boolean
}

export type RawEmail = {
    id: number
    uidl: string
    content: string
    read: boolean
}

declare global {
    interface Window {
        floodServer: () => Promise<void>
    }
}
