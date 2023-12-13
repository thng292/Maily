import { SMTPWrapper } from "@/socket"
import { Attachment, MailBuilder } from "@/data/email"
import { useContext } from "react"
import { ConfigContext } from "@/data/provider"

export function FloodServer() {
    const [config, _] = useContext(ConfigContext)
    return (
        <div className="flex items-center justify-center">
            <button onClick={clickHandle}>FloodServer</button>
        </div>
    )
    async function clickHandle() {
        console.log("Flooding")
        // const faker = require("@faker-js/faker")
        // faker.seed(12345)
        // const connection = new SMTPWrapper()
        // for (let i = 0; i < 200; i++) {
        //     const mail = new MailBuilder()
        //     mail.addSender(faker.internet.email())
        //     mail.addReceiver([config.username])
        //     mail.addSubject(faker.lorem.sentence())
        //     const content = document.createElement("p")
        //     content.innerText = faker.lorem.paragraph()
        //     mail.addContent(content)
        //     const noImage = faker.number.int({ min: 0, max: 50 }) - 40
        //     if (noImage > 0) {
        //         mail.addAttachment(
        //             faker.helpers.multiple(
        //                 () => ({
        //                     mime: "image/svg+xml",
        //                     filename: faker.internet.displayName(),
        //                     contentBase64: faker.image
        //                         .dataUri({
        //                             type: "svg-base64",
        //                         })
        //                         .slice(26),
        //                 }),
        //                 {
        //                     count: noImage,
        //                 },
        //             ),
        //         )
        //     }
        //     await connection.send(
        //         config.server,
        //         config.SMTPport,
        //         config.username,
        //         [config.username],
        //         mail.toString(),
        //     )
        // }
        console.log("Done Flooding")
    }
}
