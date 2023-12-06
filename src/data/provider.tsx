import { useMailBoxReducer, type FilteredMailBox } from "./email"
import { useConfig, DefaultConfig } from "./config"
import { createContext, ReactNode } from "react"

export const ConfigContext = createContext<ReturnType<typeof useConfig>>([
    DefaultConfig,
    (_) => {},
])
export const MailBoxContext = createContext<
    ReturnType<typeof useMailBoxReducer>
>([
    {
        mailBox: {},
        state: "loading",
        error: "",
        page: 1,
        sentPage: 1,
    },
    (_) => {},
])

export function DataProvider({ children }: { children: ReactNode }) {
    const config = useConfig()
    console.log(config[0])
    const mailBox = useMailBoxReducer(config[0])
    return (
        <ConfigContext.Provider value={config}>
            <MailBoxContext.Provider value={mailBox}>
                {children}
            </MailBoxContext.Provider>
        </ConfigContext.Provider>
    )
}
