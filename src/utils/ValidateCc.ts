import { validateEmail } from "./ValidateEmail"

export const validateCc = (value: string) => {
    // Split the cc emails by comma
    const emails = value.split(",")
    // console.log(emails)
    // Check if each email is valid
    for (let i = 0; i < emails.length; i++) {
        const email = emails[i].trim()
        if (!validateEmail(email)) {
            return false
        }
    }

    return true
}
