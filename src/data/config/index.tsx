import { useState } from "react"

type Second = number
type Day = number

type Filter = {
    name: string
    rule: {
        mail: string[]
        subject: string[]
        content: string[]
    }
}

type Config = {
    filters: Filter[]
    username: string
    password: string
    server: string
    SMTPport: number
    POP3port: number
    pullInterval: Second
}

const DefaultConfig = {
    filters: [],
    username: "",
    password: "",
    server: "",
    SMTPport: 0,
    POP3port: 0,
    pullInterval: 120,
}

function useConfig(): [Config, (newConfig: Config) => void] {
    const CONFIG_KEY = "config" as const
    let tmp = DefaultConfig
    if (localStorage.getItem(CONFIG_KEY)) {
        tmp = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "")
    }
    const [config, setConfig] = useState<Config>(tmp)

    return [
        config,
        (newConfig: Config) => {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig))
            setConfig(() => newConfig)
        },
    ]
}

function VerifyConfig(config: Config): boolean {
    return (
        config.pullInterval > 0 &&
        config.SMTPport > 0 &&
        config.SMTPport < 1 << 15 &&
        config.POP3port > 0 &&
        config.POP3port < 1 << 15 &&
        config.server.length > 0 &&
        config.password.length > 0 &&
        config.username.length > 0
    )
}

export { useConfig, VerifyConfig, DefaultConfig }
export type { Config, Filter, Second }
