export class MailBuilder {
    sender: string
    to: string[]
    cc: string[]
    bcc: string[]
    subject: string
    content: HTMLElement | null
    attchmentBase64: string[]

    constructor() {
        this.sender = ''
        this.to = []
        this.cc = []
        this.bcc = []
        this.subject = ''
        this.content = null
        this.attchmentBase64 = []
    }

    addSender(sender: string) {
        this.sender = sender
    }

    addReceiver(receiver: string[]) {
        this.to.push(...receiver)
    }

    addCC(receiver: string[]) {
        this.cc.push(...receiver)
    }

    addBCC(receiver: string[]) {
        this.bcc.push(...receiver)
    }

    addAttachmentBase64(attchmentBase64: string[]) {
        this.attchmentBase64.push(...attchmentBase64)
    }

    addSubject(subject: string) {
        this.subject = subject
    }

    addContent(content: HTMLElement) {
        this.content = content
    }

    toString(): string {
        return ''
    }
}
