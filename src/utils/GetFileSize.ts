import { Attachment } from "@/data/email"

export function GetFileSize(attch: Attachment) {
    return ((attch.contentBase64.length / 4) * 3) / 1024
}
