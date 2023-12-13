import { useMailBoxReducer } from "./email"
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
        mailBox: [],
        currentFilter: { name: "Inbox" },
        currentMail: null,
        state: "success",
        error: "",
        page: 1,
    },
    async (_) => {},
])

export function DataProvider({ children }: { children: ReactNode }) {
    const config = useConfig()
    const mailBox = useMailBoxReducer(config[0])
    return (
        <ConfigContext.Provider value={config}>
            <MailBoxContext.Provider value={mailBox}>
                {children}
            </MailBoxContext.Provider>
        </ConfigContext.Provider>
    )
}
